import { getShopCurrency } from './shopCurrencyContext.js';
import { exchangeRateFor, marginForProduct } from './shopCurrencyRates.js';
import { quotePrice } from './shopCurrency.js';

/**
 * After the fabric size and printing fee are in the catalog currency, convert
 * the unit into the shopper's currency. India is unchanged. No shopper
 * currency (admin, tests) leaves the amount alone.
 */
function quoteUnit(item: { getProduct: () => Promise<Record<string, unknown>> }, price: number) {
  const shop = getShopCurrency();
  if (!shop) {
    return price;
  }
  return item.getProduct().then((product) =>
    quotePrice(price, shop, exchangeRateFor(shop), marginForProduct(product))
  );
}

export function registerCurrencyOnCartItem(fields: unknown[]): unknown[] {
  const list = Array.isArray(fields) ? fields : [];
  return list.concat([
    {
      key: 'final_price',
      resolvers: [
        async function resolver(price: number) {
          return quoteUnit(this, price);
        }
      ],
      dependencies: ['product_price', 'product_custom_options', 'tax_percent']
    },
    {
      key: 'final_price_incl_tax',
      resolvers: [
        async function resolver(price: number) {
          return quoteUnit(this, price);
        }
      ],
      dependencies: ['product_price_incl_tax', 'product_custom_options', 'tax_percent']
    },
    {
      key: 'export_margin',
      resolvers: [
        async function resolver() {
          const product = await this.getProduct();
          return marginForProduct(product);
        }
      ],
      dependencies: ['product_id']
    }
  ]);
}

export function registerCurrencyOnCart(fields: unknown[]): unknown[] {
  const list = Array.isArray(fields) ? fields : [];
  return list.concat([
    {
      key: 'currency',
      resolvers: [
        function resolver(currency: string) {
          return getShopCurrency() ?? currency;
        }
      ]
    },
    {
      key: 'exchange_rate',
      resolvers: [
        function resolver() {
          const shop = getShopCurrency();
          if (!shop) {
            return null;
          }
          return exchangeRateFor(shop);
        }
      ]
    }
  ]);
}
