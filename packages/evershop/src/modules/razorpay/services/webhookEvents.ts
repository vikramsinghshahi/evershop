/** Money-in events this webhook settles. Anything else is acknowledged and ignored. */
export const HANDLED_RAZORPAY_PAYMENT_EVENTS = [
  'payment.captured',
  'payment.authorized',
  'payment.failed'
] as const;

export type HandledRazorpayPaymentEvent =
  (typeof HANDLED_RAZORPAY_PAYMENT_EVENTS)[number];

export function isHandledRazorpayPaymentEvent(
  type: string
): type is HandledRazorpayPaymentEvent {
  return (HANDLED_RAZORPAY_PAYMENT_EVENTS as readonly string[]).includes(type);
}

/** Money-out. Recorded through the shared refund ledger, not as a new capture. */
export function isRazorpayRefundEvent(type: string): boolean {
  return type === 'refund.processed' || type === 'refund.created';
}
