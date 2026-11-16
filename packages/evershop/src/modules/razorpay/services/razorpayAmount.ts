import smallestUnit, { display } from 'zero-decimal-currencies';

/**
 * Razorpay charges an integer number of paise. This shop sends INR only:
 * ₹10.00 is 1000. Other currencies are rejected before a request is made.
 */
export function toRazorpayMinorUnit(
  amount: number | string,
  currency: string
): number {
  if (String(currency).toUpperCase() !== 'INR') {
    throw new Error('Razorpay accepts payments in INR only.');
  }
  return parseInt(smallestUnit(amount, 'INR'), 10);
}

/** Paise from Razorpay back to rupees, for the payment ledger. */
export function fromRazorpayMinorUnit(
  amount: number,
  currency: string
): number {
  return parseFloat(display(amount, currency));
}

/**
 * The Razorpay payment must be for this order's rupee total. The order is the
 * amount that was owed; a cheaper payment must not settle a larger order.
 */
export function razorpayPaymentMatchesOrder(
  order: { grand_total: number | string; currency: string },
  payment: { amount: number; currency: string }
): boolean {
  if (String(order.currency).toUpperCase() !== 'INR') {
    return false;
  }
  if (String(payment.currency).toUpperCase() !== 'INR') {
    return false;
  }
  return payment.amount === toRazorpayMinorUnit(order.grand_total, order.currency);
}
