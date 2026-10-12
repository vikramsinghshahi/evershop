function readNumber(value: unknown): number | null {
  if (value == null || value === '') {
    return null;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default {
  Order: {
    exchangeRate: (order: { exchangeRate?: unknown; exchange_rate?: unknown }) =>
      readNumber(order?.exchangeRate ?? order?.exchange_rate)
  },
  OrderItem: {
    exportMargin: (item: { exportMargin?: unknown; export_margin?: unknown }) =>
      readNumber(item?.exportMargin ?? item?.export_margin)
  }
};
