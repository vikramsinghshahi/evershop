/** Note key written on the Razorpay order. The value is the EverShop order uuid. */
export const EVERSHOP_ORDER_NOTE = 'evershop_order_id';

/**
 * Razorpay returns `notes` as an object, or as an empty array when none were
 * set. Only the object form can carry the order uuid this server stored.
 */
export function readEvershopOrderId(notes: unknown): string | undefined {
  if (!notes || typeof notes !== 'object' || Array.isArray(notes)) {
    return undefined;
  }
  const value = (notes as Record<string, unknown>)[EVERSHOP_ORDER_NOTE];
  return typeof value === 'string' && value !== '' ? value : undefined;
}
