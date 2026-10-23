import { loadLocalShipRates } from '../../../services/localShipStore.js';
import { loadShipCountries, loadShipRates } from '../../../services/shipStore.js';
import { loadShipSurcharge } from '../../../services/shipSurchargeStore.js';

function readNumber(value: unknown): number | null {
  if (value == null || value === '') {
    return null;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function indiaLock(
  order: {
    shippingMethodData?: {
      snapshot?: { cost?: unknown; metadata?: Record<string, unknown> };
    } | null;
  },
  metadata: Record<string, unknown>
) {
  const amountInr = readNumber(metadata.amountInr);
  const weightKg = readNumber(metadata.weightKg);
  const exchangeRate = readNumber(metadata.exchangeRate);
  const charged = readNumber(order.shippingMethodData?.snapshot?.cost);
  const currency = metadata.currency;
  const serviceName = typeof metadata.serviceName === 'string' ? metadata.serviceName : '';
  if (
    amountInr == null ||
    weightKg == null ||
    exchangeRate == null ||
    charged == null ||
    typeof currency !== 'string' ||
    serviceName === ''
  ) {
    return null;
  }
  return {
    zone: null,
    service: typeof metadata.service === 'string' ? metadata.service : null,
    serviceName,
    weightKg,
    billedWeightKg: readNumber(metadata.billedWeightKg) ?? weightKg,
    amountInr,
    surchargePercent: null,
    chargedInr: readNumber(metadata.chargedInr),
    exchangeRate,
    currency,
    perKgRateInr: readNumber(metadata.perKgRateInr),
    extraKg: readNumber(metadata.extraKg),
    charged
  };
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
  if (metadata.kind === 'india') {
    return indiaLock(order, metadata);
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
    service: null,
    serviceName: null,
    weightKg,
    billedWeightKg: readNumber(metadata.billedWeightKg) ?? weightKg,
    amountInr,
    surchargePercent: readNumber(metadata.surchargePercent),
    chargedInr: readNumber(metadata.chargedInr),
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
    fabricShipRates: () => loadShipRates(),
    fabricShipSurcharge: () => loadShipSurcharge(),
    fabricLocalShipRates: () => loadLocalShipRates()
  },
  Order: {
    fabricShipLock: shipLock
  }
};
