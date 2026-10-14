export type ShipBand = 'slab' | 'per_kg';

export interface ShipRateRow {
  band: ShipBand;
  weightKg: number;
  zone: number;
  amountInr: number;
}

/** What was read off the card. This is the record copied onto the order. */
export interface ShipQuote {
  zone: number;
  /** Cart weight in kilograms. Zero is billed as the 1 kg minimum. */
  weightKg: number;
  /** The slab row used, or 20 when the per-kilogram rows take over. */
  billedWeightKg: number;
  amountInr: number;
  /** Rupees per extra kilogram after 20 kg. Null on a slab quote. */
  perKgRateInr: number | null;
  /** Whole kilograms added after the 20 kg row. Null on a slab quote. */
  extraKg: number | null;
}

/** Card weights are kilograms. The store weight unit may not be. */
export function weightToKilograms(weight: number, unit: string): number {
  if (!Number.isFinite(weight) || weight < 0) {
    return 0;
  }
  switch (unit) {
    case 'g':
      return weight / 1000;
    case 'lb':
      return weight * 0.45359237;
    case 'oz':
      return weight * 0.028349523125;
    default:
      return weight;
  }
}

const ZONES = 13;
const SLAB_CAP_KG = 20;
const SLAB_STEP_KG = 0.5;
/** Nothing is billed below 1 kg. The 0.5 kg row on the card is not used. */
export const MIN_BILLED_KG = 1;

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function money(value: number): number {
  return Math.round(value * 100) / 100;
}

function weightKey(weightKg: number): string {
  return (Math.round(weightKg * 10) / 10).toFixed(1);
}

/**
 * Next half-kilogram that covers the weight. 1.0 stays 1.0. 1.01 becomes 1.5.
 * 0 and anything up to 1 kg becomes the 1 kg minimum.
 */
export function billableSlabKg(weightKg: number): number {
  const grams = Math.max(0, Math.round(weightKg * 1000));
  const steps = Math.ceil(grams / 500);
  return Math.min(SLAB_CAP_KG, Math.max(MIN_BILLED_KG, steps * SLAB_STEP_KG));
}

function indexRates(rates: ShipRateRow[]): {
  slab: Map<string, number>;
  perKg: Map<string, number>;
} {
  const slab = new Map<string, number>();
  const perKg = new Map<string, number>();
  for (const rate of rates) {
    if (!Number.isFinite(rate.amountInr) || rate.amountInr < 0) {
      continue;
    }
    if (!Number.isInteger(rate.zone) || rate.zone < 1 || rate.zone > ZONES) {
      continue;
    }
    if (!Number.isFinite(rate.weightKg) || rate.weightKg <= 0) {
      continue;
    }
    const key = `${rate.zone}:${weightKey(rate.weightKg)}`;
    if (rate.band === 'slab') {
      slab.set(key, rate.amountInr);
    } else if (rate.band === 'per_kg') {
      perKg.set(key, rate.amountInr);
    }
  }
  return { slab, perKg };
}

function nextSlab(
  slab: Map<string, number>,
  zone: number,
  billedKg: number
): { weightKg: number; amountInr: number } | null {
  let chosen: { weightKg: number; amountInr: number } | null = null;
  for (const [key, amountInr] of slab) {
    const [zoneText, weightText] = key.split(':');
    if (Number(zoneText) !== zone) {
      continue;
    }
    const weightKg = Number(weightText);
    if (weightKg + 1e-9 < billedKg) {
      continue;
    }
    if (!chosen || weightKg < chosen.weightKg) {
      chosen = { weightKg, amountInr };
    }
  }
  return chosen;
}

/**
 * Rupee charge for one parcel, as printed on the card.
 * Up to 20 kg, the half-kilogram row that covers the weight, never below 1 kg.
 * Above 20 kg, the 20 kg row plus whole extra kilograms at the 21 / 45 / 71 rate.
 * A missing row does not fall through to a cheaper one.
 */
export function quoteShipInr(
  weightKg: number,
  zone: number,
  rates: ShipRateRow[]
): ShipQuote | null {
  if (!Number.isInteger(zone) || zone < 1 || zone > ZONES) {
    return null;
  }
  if (!Number.isFinite(weightKg) || weightKg < 0) {
    return null;
  }
  const weight = weightKg === 0 ? MIN_BILLED_KG : round3(weightKg);
  const { slab, perKg } = indexRates(rates);

  if (weight <= SLAB_CAP_KG) {
    const row = nextSlab(slab, zone, billableSlabKg(weight));
    if (!row) {
      return null;
    }
    return {
      zone,
      weightKg: weight,
      billedWeightKg: row.weightKg,
      amountInr: money(row.amountInr),
      perKgRateInr: null,
      extraKg: null
    };
  }

  const base = slab.get(`${zone}:${weightKey(SLAB_CAP_KG)}`);
  if (base == null) {
    return null;
  }
  const threshold = weight >= 71 ? 71 : weight >= 45 ? 45 : 21;
  const perKgRate = perKg.get(`${zone}:${weightKey(threshold)}`);
  if (perKgRate == null) {
    return null;
  }
  const extraKg = Math.ceil(round3(weight - SLAB_CAP_KG));
  if (extraKg < 1) {
    return null;
  }
  return {
    zone,
    weightKg: weight,
    billedWeightKg: SLAB_CAP_KG,
    amountInr: money(base + extraKg * perKgRate),
    perKgRateInr: perKgRate,
    extraKg
  };
}
