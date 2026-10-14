/**
 * Percent added on top of the export card price before the shopper sees it.
 * It covers Indian GST and duties the buyer abroad does not know about, so
 * checkout shows one shipping amount with this already inside it.
 */
export const SHIP_SURCHARGE_SETTING = 'exportShippingSurcharge';
export const DEFAULT_SHIP_SURCHARGE = 80;
export const MAX_SHIP_SURCHARGE = 1000;

export class ShipSurchargeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShipSurchargeError';
  }
}

function parse(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  const text = String(value ?? '').replace(/%/g, '').trim();
  return text === '' ? NaN : Number(text);
}

/**
 * The stored percent, for pricing. Blank or unreadable falls back to the
 * default, so a bad row never ships an order at the bare card price.
 * Zero is kept: it means no surcharge.
 */
export function readShipSurcharge(value: unknown): number {
  const parsed = parse(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > MAX_SHIP_SURCHARGE) {
    return DEFAULT_SHIP_SURCHARGE;
  }
  return Math.round(parsed * 100) / 100;
}

/** The percent an admin typed. Rejected instead of guessed. */
export function normalizeShipSurcharge(value: unknown): number {
  const parsed = parse(value);
  if (!Number.isFinite(parsed)) {
    throw new ShipSurchargeError('Enter the shipping surcharge as a number, for example 80');
  }
  if (parsed < 0) {
    throw new ShipSurchargeError('The shipping surcharge cannot be negative');
  }
  if (parsed > MAX_SHIP_SURCHARGE) {
    throw new ShipSurchargeError(
      `The shipping surcharge cannot be more than ${MAX_SHIP_SURCHARGE}%`
    );
  }
  return Math.round(parsed * 100) / 100;
}

/** Card rupees plus the percent. 1134 at 80% is 2041.20. */
export function applyShipSurcharge(amountInr: number, percent: number): number {
  const amount = Number(amountInr);
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }
  const safe = Number.isFinite(percent) && percent > 0 ? percent : 0;
  return Math.round(amount * (1 + safe / 100) * 100) / 100;
}
