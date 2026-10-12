import { getSettingSync } from '../../setting/services/setting.js';
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
