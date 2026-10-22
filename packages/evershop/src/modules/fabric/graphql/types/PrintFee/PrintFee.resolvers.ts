import { isShopCurrency } from '../../../services/shopCurrency.js';
import { getShopCurrency } from '../../../services/shopCurrencyContext.js';
import { quotePrintFeeInOptions } from '../../../services/shopCurrencyRates.js';

function readRate(value: unknown): number | undefined {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function quoteLineOptions(
  item: {
    productCustomOptions?: string | null;
    product_custom_options?: string | null;
    productSku?: unknown;
    product_sku?: unknown;
    exportMargin?: unknown;
    export_margin?: unknown;
  },
  currency?: ReturnType<typeof getShopCurrency>,
  rate?: number
): string | null | undefined {
  const raw = item?.productCustomOptions ?? item?.product_custom_options;
  return quotePrintFeeInOptions(raw, {
    sku: item?.productSku ?? item?.product_sku,
    exportMargin: item?.exportMargin ?? item?.export_margin,
    currency,
    rate
  });
}

export default {
  CartItem: {
    productCustomOptions: (item) => quoteLineOptions(item, getShopCurrency())
  },
  OrderItem: {
    productCustomOptions: (item, _, context: { orderCurrency?: unknown; orderExchangeRate?: unknown }) => {
      const currency = isShopCurrency(context?.orderCurrency)
        ? context.orderCurrency
        : getShopCurrency();
      return quoteLineOptions(item, currency, readRate(context?.orderExchangeRate));
    }
  }
};
