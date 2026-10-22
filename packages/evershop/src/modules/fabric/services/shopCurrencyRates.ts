import { getSettingSync } from '../../setting/services/setting.js';
import { printFeeFromOptions } from './printFee.js';
import { isFabricSku } from './printScale.js';
import { getShopCurrency } from './shopCurrencyContext.js';
import {
  BASE_CURRENCY,
  DEFAULT_EXCHANGE_RATES,
  DEFAULT_EXPORT_MARGIN,
  exportMarginPercent,
  quotePrice,
  readDefaultMargin,
  readExchangeRate,
  type ShopCurrency
} from './shopCurrency.js';

const RATE_SETTING: Record<Exclude<ShopCurrency, 'INR'>, string> = {
  USD: 'exchangeRateUsd',
  EUR: 'exchangeRateEur',
  AUD: 'exchangeRateAud',
  GBP: 'exchangeRateGbp'
};

export function exchangeRateFor(currency: ShopCurrency): number {
  if (currency === BASE_CURRENCY) {
    return 1;
  }
  const key = RATE_SETTING[currency];
  return readExchangeRate(
    getSettingSync(key, DEFAULT_EXCHANGE_RATES[currency]),
    DEFAULT_EXCHANGE_RATES[currency]
  );
}

export function storeExportMargin(): number {
  return readDefaultMargin(getSettingSync('defaultExportMargin', DEFAULT_EXPORT_MARGIN));
}

export function marginForProduct(product: {
  sku?: unknown;
  export_margin?: unknown;
  exportMargin?: unknown;
} | null | undefined): number {
  const shop = getShopCurrency();
  if (!shop || shop === BASE_CURRENCY) {
    return 0;
  }
  return exportMarginPercent(
    product?.exportMargin ?? product?.export_margin,
    isFabricSku(product?.sku),
    storeExportMargin()
  );
}

/** Catalog amount in the shopper's currency. No shopper currency leaves it alone. */
export function quoteCatalogAmount(
  amount: number | null,
  product: { sku?: unknown; export_margin?: unknown; exportMargin?: unknown } | null | undefined
): number | null {
  if (amount == null || !Number.isFinite(amount)) {
    return amount;
  }
  const shop = getShopCurrency();
  if (!shop) {
    return amount;
  }
  return quotePrice(amount, shop, exchangeRateFor(shop), marginForProduct(product));
}

export function quotePrintFeeInOptions(
  raw: string | null | undefined,
  hint?: {
    sku?: unknown;
    exportMargin?: unknown;
    export_margin?: unknown;
    currency?: ShopCurrency;
    rate?: number;
  }
): string | null | undefined {
  if (!raw || typeof raw !== 'string') {
    return raw;
  }
  const fee = printFeeFromOptions(raw);
  if (!fee) {
    return raw;
  }
  const currency = hint?.currency ?? getShopCurrency();
  if (!currency) {
    return raw;
  }
  const rate =
    hint?.rate != null && Number.isFinite(hint.rate) && hint.rate > 0
      ? hint.rate
      : exchangeRateFor(currency);
  const storedMargin = hint?.exportMargin ?? hint?.export_margin;
  const margin = exportMarginPercent(
    storedMargin,
    isFabricSku(hint?.sku),
    storedMargin == null || storedMargin === '' ? storeExportMargin() : 0
  );
  const quoted = quotePrice(fee, currency, rate, margin);
  try {
    const data = JSON.parse(raw) as { printFee?: unknown; printFeeCurrency?: unknown };
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return raw;
    }
    data.printFee = quoted;
    data.printFeeCurrency = currency;
    return JSON.stringify(data);
  } catch {
    return raw;
  }
}
