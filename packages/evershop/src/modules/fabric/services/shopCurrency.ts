import { toPrice } from '../../checkout/services/toPrice.js';
import { readPrintFee } from './printFee.js';

/** India price is the catalog price. These are the currencies a shopper can pay in. */
export const SHOP_CURRENCIES = ['INR', 'USD', 'EUR', 'AUD', 'GBP'] as const;

export type ShopCurrency = (typeof SHOP_CURRENCIES)[number];

export const BASE_CURRENCY: ShopCurrency = 'INR';

/** Rupees for one unit of that currency, until an admin saves a rate. */
export const DEFAULT_EXCHANGE_RATES: Record<Exclude<ShopCurrency, 'INR'>, number> = {
  USD: 83,
  EUR: 90,
  AUD: 54,
  GBP: 105
};

/** Used when a fabric has no export margin of its own. */
export const DEFAULT_EXPORT_MARGIN = 20;

const COOKIE = 'shop_currency';

export const SHOP_CURRENCY_COOKIE = COOKIE;

export function isShopCurrency(value: unknown): value is ShopCurrency {
  return SHOP_CURRENCIES.includes(value as ShopCurrency);
}

/** A blank or unusable rate falls back to the starting rate. Zero is not a rate. */
export function readExchangeRate(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(String(value ?? '').trim());
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.round(parsed * 10000) / 10000;
}

/** A blank store default is the starting margin. Zero is kept. */
export function readDefaultMargin(value: unknown): number {
  if (value === null || value === undefined || value === '') {
    return DEFAULT_EXPORT_MARGIN;
  }
  const parsed = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isFinite(parsed) || parsed < 0) {
    return DEFAULT_EXPORT_MARGIN;
  }
  return Math.round(parsed * 100) / 100;
}

/**
 * Margin for one product. An explicit amount, including zero, wins.
 * A blank fabric uses the store default. A blank accessory adds nothing.
 */
/** Empty clears the margin. Absent from the payload leaves the stored margin alone. */
export function normalizeExportMargin(data: Record<string, unknown> | null | undefined): void {
  if (!data || typeof data !== 'object' || !('export_margin' in data)) {
    return;
  }
  data.export_margin = readPrintFee(data.export_margin);
}

export function exportMarginPercent(
  stored: unknown,
  fabric: boolean,
  storeDefault: number
): number {
  const explicit = readPrintFee(stored);
  if (explicit != null) {
    return explicit;
  }
  return fabric ? storeDefault : 0;
}

/**
 * India pays the catalog amount. Every other currency is
 * catalog × (1 + margin ÷ 100) ÷ rupees-per-unit.
 * A positive catalog amount never rounds down to zero.
 */
export function quotePrice(
  amountInr: number,
  currency: ShopCurrency,
  rate: number,
  marginPercent: number
): number {
  const amount = Number(amountInr);
  if (!Number.isFinite(amount) || amount === 0) {
    return 0;
  }
  if (currency === BASE_CURRENCY) {
    return toPrice(String(amount));
  }
  const safeRate = readExchangeRate(rate, 0);
  if (safeRate <= 0) {
    return toPrice(String(amount));
  }
  const margin = Number.isFinite(marginPercent) && marginPercent > 0 ? marginPercent : 0;
  const quoted = toPrice(String((amount * (1 + margin / 100)) / safeRate));
  if (amount > 0 && quoted <= 0) {
    return toPrice('0.01');
  }
  if (amount < 0 && quoted >= 0) {
    return toPrice('-0.01');
  }
  return quoted;
}
