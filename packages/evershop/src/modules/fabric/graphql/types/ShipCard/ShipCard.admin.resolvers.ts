import { loadShipCountries, loadShipRates } from '../../../services/shipStore.js';

function readNumber(value: unknown): number | null {
  if (value == null || value === '') {
    return null;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function shipLock(order: {
  shippingMethodData?: {
    snapshot?: { cost?: unknown; metadata?: Record<string, unknown> };
  } | null;
}) {
  const metadata = order?.shippingMethodData?.snapshot?.metadata;
  if (!metadata) {
    return null;
  }
  const amountInr = readNumber(metadata.amountInr);
  const zone = readNumber(metadata.zone);
  const weightKg = readNumber(metadata.weightKg);
  const exchangeRate = readNumber(metadata.exchangeRate);
  const charged = readNumber(order.shippingMethodData?.snapshot?.cost);
  const currency = metadata.currency;
  if (
    amountInr == null ||
    zone == null ||
    weightKg == null ||
    exchangeRate == null ||
    charged == null ||
    typeof currency !== 'string'
  ) {
    return null;
  }
  return {
    zone,
    weightKg,
    billedWeightKg: readNumber(metadata.billedWeightKg) ?? weightKg,
    amountInr,
    exchangeRate,
    currency,
    perKgRateInr: readNumber(metadata.perKgRateInr),
    extraKg: readNumber(metadata.extraKg),
    charged
  };
}

export default {
  Query: {
    fabricShipCountries: () => loadShipCountries(),
    fabricShipRates: () => loadShipRates()
  },
  Order: {
    fabricShipLock: shipLock
  }
};
