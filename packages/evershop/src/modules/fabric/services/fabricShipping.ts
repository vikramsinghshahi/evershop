import type {
  ShippingContext,
  ShippingMethod,
  ShippingProvider
} from '../../../types/shippingProvider.js';
import { registerShippingProvider } from '../../checkout/services/shipping/registry.js';
import { getSettingSync } from '../../setting/services/setting.js';
import { quoteIndiaShip } from './localShipStore.js';
import { weightToKilograms } from './shipQuote.js';
import { quoteCountryShip } from './shipStore.js';
import { applyShipSurcharge } from './shipSurcharge.js';
import { storeShipSurcharge } from './shipSurchargeStore.js';
import {
  isShopCurrency,
  quotePrice,
  type ShopCurrency
} from './shopCurrency.js';
import { exchangeRateFor } from './shopCurrencyRates.js';

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
  const surchargePercent = storeShipSurcharge();
  const chargedInr = applyShipSurcharge(quote.amountInr, surchargePercent);
  return {
    code: FABRIC_SHIP_METHOD,
    name: 'Standard delivery',
    cost: quotePrice(chargedInr, currency, rate, 0),
    metadata: {
      zone: quote.zone,
      weightKg: quote.weightKg,
      billedWeightKg: quote.billedWeightKg,
      amountInr: quote.amountInr,
      surchargePercent,
      chargedInr,
      exchangeRate: rate,
      currency,
      perKgRateInr: quote.perKgRateInr,
      extraKg: quote.extraKg
    }
  };
}

/** DTDC Lite, Plus, and Prime. No export surcharge. India addresses only. */
export async function indiaShipMethods(ctx: ShippingContext): Promise<ShippingMethod[]> {
  const country = ctx.destination?.country?.trim().toUpperCase();
  if (
    country !== 'IN' ||
    !isShopCurrency(ctx.currency) ||
    !Number.isFinite(ctx.totalWeight) ||
    ctx.totalWeight < 0
  ) {
    return [];
  }
  const currency = ctx.currency as ShopCurrency;
  const unit = String(getSettingSync('weightUnit', 'kg') || 'kg');
  const weightKg = weightToKilograms(ctx.totalWeight, unit);
  const quotes = await quoteIndiaShip(weightKg);
  const rate = exchangeRateFor(currency);
  return quotes.map((quote) => ({
    code: `fabric-india-${quote.service}`,
    name: quote.serviceName,
    cost: quotePrice(quote.amountInr, currency, rate, 0),
    metadata: {
      kind: 'india',
      service: quote.service,
      serviceName: quote.serviceName,
      weightKg: quote.weightKg,
      billedWeightKg: quote.billedWeightKg,
      amountInr: quote.amountInr,
      chargedInr: quote.amountInr,
      exchangeRate: rate,
      currency,
      perKgRateInr: quote.perKgRateInr,
      extraKg: quote.extraKg
    }
  }));
}

export const fabricShippingProvider: ShippingProvider = {
  code: 'fabric',
  name: 'Export rate card',
  description:
    'Export rates from the zone and weight card, plus the export surcharge. Addresses in India use the DTDC Lite, Plus, and Prime prices, with no export surcharge.',
  quoteTtlSeconds: 120,
  async getMethods(ctx) {
    if (ctx.destination?.country?.trim().toUpperCase() === 'IN') {
      return indiaShipMethods(ctx);
    }
    const method = await fabricShipMethod(ctx);
    return method ? [method] : [];
  }
};

export function registerFabricShipping(): void {
  registerShippingProvider(fabricShippingProvider);
}
