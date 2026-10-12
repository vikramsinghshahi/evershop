import type { EvershopRequest } from '../../../types/request.js';
import type { EvershopResponse } from '../../../types/response.js';
import { runWithShopCurrency } from './shopCurrencyContext.js';
import {
  BASE_CURRENCY,
  isShopCurrency,
  SHOP_CURRENCY_COOKIE,
  type ShopCurrency
} from './shopCurrency.js';

const YEAR = 60 * 60 * 24 * 365;

function cookieOptions() {
  return {
    path: '/',
    maxAge: YEAR * 1000,
    sameSite: 'lax' as const,
    httpOnly: true
  };
}

function countryCode(request: EvershopRequest): string {
  const header =
    request.headers['cf-ipcountry'] ||
    request.headers['x-vercel-ip-country'] ||
    request.headers['cloudfront-viewer-country'];
  const value = Array.isArray(header) ? header[0] : header;
  return String(value || '').trim().toUpperCase();
}

function fromCountry(request: EvershopRequest): ShopCurrency {
  return countryCode(request) === 'IN' ? 'INR' : 'USD';
}

function fromCookie(request: EvershopRequest): ShopCurrency | null {
  const value = request.cookies?.[SHOP_CURRENCY_COOKIE];
  return isShopCurrency(value) ? value : null;
}

function fromQuery(request: EvershopRequest): ShopCurrency | null {
  const value = request.query?.currency;
  const code = Array.isArray(value) ? value[0] : value;
  return isShopCurrency(code) ? code : null;
}

/**
 * Remember the shopper's currency and make it visible to price and cart code
 * for the rest of this request. A `?currency=` on a page switches it and
 * reloads without that parameter.
 */
export function applyShopCurrency(
  request: EvershopRequest,
  response: EvershopResponse,
  next: () => void,
  allowSwitch: boolean
): void {
  const requested = allowSwitch ? fromQuery(request) : null;
  const currency = requested || fromCookie(request) || fromCountry(request) || BASE_CURRENCY;
  response.cookie(SHOP_CURRENCY_COOKIE, currency, cookieOptions());
  if (requested && request.method === 'GET') {
    const url = new URL(request.originalUrl || '/', 'http://localhost');
    if (url.searchParams.has('currency')) {
      url.searchParams.delete('currency');
      response.redirect(302, `${url.pathname}${url.search}`);
      return;
    }
  }
  runWithShopCurrency(currency, () => next());
}
