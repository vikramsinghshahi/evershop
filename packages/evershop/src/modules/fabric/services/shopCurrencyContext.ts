import { AsyncLocalStorage } from 'node:async_hooks';
import type { ShopCurrency } from './shopCurrency.js';

/**
 * The currency this request is showing and charging. Unset off a storefront
 * request (admin, tests, email), so those paths keep the raw catalog amount.
 */
const store = new AsyncLocalStorage<ShopCurrency>();

export function runWithShopCurrency<T>(currency: ShopCurrency, fn: () => T): T {
  return store.run(currency, fn);
}

export function getShopCurrency(): ShopCurrency | undefined {
  return store.getStore();
}
