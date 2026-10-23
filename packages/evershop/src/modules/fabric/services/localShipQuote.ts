export type LocalService = 'lite' | 'plus' | 'prime';
export type LocalBandKind = 'slab' | 'per_kg';

export interface LocalRateRow {
  service: LocalService;
  band: LocalBandKind;
  weightKg: number;
  amountInr: number;
}

/** What checkout charges, copied onto the order. */
export interface LocalShipQuote {
  service: LocalService;
  serviceName: string;
  /** Cart weight in kilograms. Zero is billed as the first slab. */
  weightKg: number;
  /** Slab that covered the weight, or 5 when extra kilograms are added. */
  billedWeightKg: number;
  amountInr: number;
  /** Rupees per kilogram above 5 kg. Null on a slab quote. */
  perKgRateInr: number | null;
  /** Whole kilograms added after 5 kg. Null on a slab quote. */
  extraKg: number | null;
}

export const LOCAL_SERVICES: { code: LocalService; name: string }[] = [
  { code: 'lite', name: 'DTDC Lite' },
  { code: 'plus', name: 'DTDC Plus' },
  { code: 'prime', name: 'DTDC Prime' }
];

/**
 * Published DTDC bands. `[low, high]` is the range on the card.
 * Checkout is seeded with the high end so a distant Indian address is covered.
 * Admin edits replace that number; the range stays as a label.
 */
export interface LocalBand {
  band: LocalBandKind;
  weightKg: number;
  label: string;
  card: Record<LocalService, readonly [number, number]>;
}

export const LOCAL_BANDS: LocalBand[] = [
  {
    band: 'slab',
    weightKg: 0.5,
    label: 'Up to 500g',
    card: { lite: [40, 100], plus: [60, 150], prime: [80, 250] }
  },
  {
    band: 'slab',
    weightKg: 1,
    label: '500g – 1kg',
    card: { lite: [100, 200], plus: [150, 250], prime: [250, 350] }
  },
  {
    band: 'slab',
    weightKg: 2,
    label: '1kg – 2kg',
    card: { lite: [200, 300], plus: [250, 350], prime: [350, 450] }
  },
  {
    band: 'slab',
    weightKg: 3,
    label: '2kg – 3kg',
    card: { lite: [300, 400], plus: [350, 450], prime: [450, 550] }
  },
  {
    band: 'slab',
    weightKg: 5,
    label: '3kg – 5kg',
    card: { lite: [400, 500], plus: [450, 550], prime: [550, 650] }
  },
  {
    band: 'per_kg',
    weightKg: 5,
    label: 'Above 5kg',
    card: { lite: [100, 100], plus: [100, 100], prime: [150, 150] }
  }
];

/** High end of each band. An admin save replaces these rows. */
export const LOCAL_SHIP_SEED: LocalRateRow[] = LOCAL_BANDS.flatMap((band) =>
  LOCAL_SERVICES.map((service) => ({
    service: service.code,
    band: band.band,
    weightKg: band.weightKg,
    amountInr: band.card[service.code][1]
  }))
);

export function localService(value: unknown): LocalService | null {
  if (value === 'lite' || value === 'plus' || value === 'prime') {
    return value;
  }
  return null;
}

/** A weight the card actually has. Anything else is not a rate. */
export function localWeightKg(band: LocalBandKind, weightKg: number): number | null {
  const weight = Math.round(Number(weightKg) * 10) / 10;
  if (!Number.isFinite(weight)) {
    return null;
  }
  if (
    band === 'slab' &&
    (weight === 0.5 || weight === 1 || weight === 2 || weight === 3 || weight === 5)
  ) {
    return weight;
  }
  if (band === 'per_kg' && weight === 5) {
    return weight;
  }
  return null;
}

export function localCardLabel(band: LocalBand, service: LocalService): string {
  const [low, high] = band.card[service];
  if (band.band === 'per_kg') {
    return `Band +₹${high}/kg`;
  }
  return `Band ₹${low}–${high}`;
}

function weightKey(weightKg: number): string {
  return (Math.round(weightKg * 10) / 10).toFixed(1);
}

function money(value: number): number {
  return Math.round(value * 100) / 100;
}

function billLocal(
  weightKg: number
): { kind: 'slab'; billedWeightKg: number } | { kind: 'extra'; extraKg: number } | null {
  const grams = Math.round(weightKg * 1000);
  if (!Number.isFinite(grams) || grams < 0) {
    return null;
  }
  if (grams <= 500) {
    return { kind: 'slab', billedWeightKg: 0.5 };
  }
  if (grams <= 1000) {
    return { kind: 'slab', billedWeightKg: 1 };
  }
  if (grams <= 2000) {
    return { kind: 'slab', billedWeightKg: 2 };
  }
  if (grams <= 3000) {
    return { kind: 'slab', billedWeightKg: 3 };
  }
  if (grams <= 5000) {
    return { kind: 'slab', billedWeightKg: 5 };
  }
  const extraKg = Math.ceil((grams - 5000) / 1000);
  if (!Number.isInteger(extraKg) || extraKg < 1) {
    return null;
  }
  return { kind: 'extra', extraKg };
}

function indexRates(rates: LocalRateRow[]): Map<string, number> {
  const indexed = new Map<string, number>();
  for (const rate of rates) {
    const service = localService(rate.service);
    const band = rate.band === 'slab' || rate.band === 'per_kg' ? rate.band : null;
    const weight = band ? localWeightKg(band, rate.weightKg) : null;
    if (!service || !band || weight == null) {
      continue;
    }
    if (!Number.isFinite(rate.amountInr) || rate.amountInr < 0) {
      continue;
    }
    indexed.set(`${service}:${band}:${weightKey(weight)}`, rate.amountInr);
  }
  return indexed;
}

/**
 * Rupee charge for one parcel inside India.
 * Up to 5 kg, the slab that covers the weight. 500 g and under uses the first row.
 * Above 5 kg, the 5 kg price plus each extra kilogram, rounded up.
 * A missing cell does not fall through to another row or another service.
 */
export function quoteLocalShip(
  weightKg: number,
  service: string,
  rates: LocalRateRow[]
): LocalShipQuote | null {
  const code = localService(service);
  if (!code || !Number.isFinite(weightKg) || weightKg < 0) {
    return null;
  }
  const bill = billLocal(weightKg);
  if (!bill) {
    return null;
  }
  const serviceName = LOCAL_SERVICES.find((item) => item.code === code)?.name;
  if (!serviceName) {
    return null;
  }
  const indexed = indexRates(rates);
  const weight = weightKg === 0 ? 0 : Math.round(weightKg * 1000) / 1000;

  if (bill.kind === 'slab') {
    const amount = indexed.get(`${code}:slab:${weightKey(bill.billedWeightKg)}`);
    if (amount == null) {
      return null;
    }
    return {
      service: code,
      serviceName,
      weightKg: weight,
      billedWeightKg: bill.billedWeightKg,
      amountInr: money(amount),
      perKgRateInr: null,
      extraKg: null
    };
  }

  const base = indexed.get(`${code}:slab:${weightKey(5)}`);
  const perKg = indexed.get(`${code}:per_kg:${weightKey(5)}`);
  if (base == null || perKg == null) {
    return null;
  }
  return {
    service: code,
    serviceName,
    weightKg: weight,
    billedWeightKg: 5,
    amountInr: money(base + bill.extraKg * perKg),
    perKgRateInr: perKg,
    extraKg: bill.extraKg
  };
}
