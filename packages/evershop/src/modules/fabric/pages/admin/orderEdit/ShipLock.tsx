import React from 'react';

interface FabricShipLockProps {
  order?: {
    fabricShipLock?: {
      zone?: number | null;
      weightKg?: number | null;
      billedWeightKg?: number | null;
      amountInr?: number | null;
      exchangeRate?: number | null;
      currency?: string | null;
      perKgRateInr?: number | null;
      extraKg?: number | null;
      charged?: number | null;
    } | null;
  } | null;
}

function rupees(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function chargedAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/** The shipping card row frozen on this order. Later card edits do not change it. */
export default function ShipLock({ order }: FabricShipLockProps) {
  const lock = order?.fabricShipLock;
  if (
    !lock ||
    lock.zone == null ||
    lock.weightKg == null ||
    lock.amountInr == null ||
    lock.exchangeRate == null ||
    lock.charged == null ||
    !lock.currency
  ) {
    return null;
  }
  const extra =
    lock.extraKg != null && lock.perKgRateInr != null
      ? ` The 20 kg row plus ${lock.extraKg} kg at ${rupees(lock.perKgRateInr)} per kg.`
      : '';
  return (
    <p className="mt-1 text-sm text-muted-foreground">
      {`Shipping zone ${lock.zone}, ${lock.weightKg} kg, card ${rupees(lock.amountInr)}, charged ${chargedAmount(lock.charged, lock.currency)} at ${lock.exchangeRate} INR per 1 ${lock.currency}.${extra}`}
    </p>
  );
}

export const layout = {
  areaId: 'rightSide',
  sortOrder: 6
};

export const query = `
  query Query {
    order(uuid: getContextValue("orderId", null)) {
      fabricShipLock {
        zone
        weightKg
        billedWeightKg
        amountInr
        exchangeRate
        currency
        perKgRateInr
        extraKg
        charged
      }
    }
  }
`;
