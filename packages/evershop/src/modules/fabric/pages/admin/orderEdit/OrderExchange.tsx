import React from 'react';

interface OrderExchangeProps {
  order?: {
    currency?: string | null;
    exchangeRate?: number | null;
  } | null;
}

/** The rate frozen when the order was placed. Older orders have none. */
export default function OrderExchange({ order }: OrderExchangeProps) {
  if (!order?.currency || order.exchangeRate == null) {
    return null;
  }
  const rate = Number(order.exchangeRate);
  if (!Number.isFinite(rate)) {
    return null;
  }
  const detail =
    order.currency === 'INR'
      ? 'Charged in INR. The catalog price was used, with no export margin.'
      : `Charged in ${order.currency} at ${rate} INR per 1 ${order.currency}.`;
  return <p className="mt-1 text-sm text-muted-foreground">{detail}</p>;
}

export const layout = {
  areaId: 'rightSide',
  sortOrder: 5
};

export const query = `
  query Query {
    order(uuid: getContextValue("orderId", null)) {
      currency
      exchangeRate
    }
  }
`;
