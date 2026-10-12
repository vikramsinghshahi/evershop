import { getSettingSync } from '../../setting/services/setting.js';
import { registerShippingProvider } from '../../checkout/services/shipping/registry.js';
import type {
  ShippingContext,
  ShippingMethod,
  ShippingProvider
} from '../../../types/shippingProvider.js';
import { quoteCountryShip } from './shipStore.js';
import { weightToKilograms } from './shipQuote.js';
import { exchangeRateFor } from './shopCurrencyRates.js';
import {
  isShopCurrency,
  quotePrice,
  type ShopCurrency
} from './shopCurrency.js';

export const FABRIC_SHIP_METHOD = 'fabric-export';

export async function fabricShipMethod(
  ctx: ShippingContext
): Promise<ShippingMethod | null> {
  const country = ctx.destination?.country;
  if (
    !country ||
    !isShopCurrency(ctx.currency) ||
    !Number.isFinite(ctx.totalWeight) ||
    ctx.totalWeight < 0
  ) {
    return null;
  }
  const currency = ctx.currency as ShopCurrency;
  const unit = String(getSettingSync('weightUnit', 'kg') || 'kg');
  const weightKg = weightToKilograms(ctx.totalWeight, unit);
  const quote = await quoteCountryShip(country, weightKg);
  if (!quote) {
    return null;
  }
  const rate = exchangeRateFor(currency);
  return {
    code: FABRIC_SHIP_METHOD,
    name: 'Standard delivery',
    cost: quotePrice(quote.amountInr, currency, rate, 0),
    metadata: {
      zone: quote.zone,
      weightKg: quote.weightKg,
      billedWeightKg: quote.billedWeightKg,
      amountInr: quote.amountInr,
      exchangeRate: rate,
      currency,
      perKgRateInr: quote.perKgRateInr,
      extraKg: quote.extraKg
    }
  };
}

export const fabricShippingProvider: ShippingProvider = {
  code: 'fabric',
  name: 'Export rate card',
  description:
    'Shipping from the zone and weight card. The rupee charge is divided by the order rate, with no export margin.',
  quoteTtlSeconds: 120,
  async getMethods(ctx) {
    const method = await fabricShipMethod(ctx);
    return method ? [method] : [];
  }
};

export function registerFabricShipping(): void {
  registerShippingProvider(fabricShippingProvider);
}
