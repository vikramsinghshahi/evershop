import smallestUnit, { display } from 'zero-decimal-currencies';

/**
 * Razorpay charges an integer in the currency's smallest unit. ₹10.00 is 1000
 * paise. $10.00 is 1000 cents. The currency is the one on the order, which is
 * the currency the customer selected.
 */
export function toRazorpayMinorUnit(
  amount: number | string,
  currency: string
): number {
  return parseInt(smallestUnit(amount, currency.toUpperCase()), 10);
}

/** Smallest units from Razorpay back to major units, for the payment ledger. */
export function fromRazorpayMinorUnit(
  amount: number,
  currency: string
): number {
  return parseFloat(display(amount, currency));
}

/**
 * The Razorpay payment must be for this order's total in the same currency.
 * The order is the amount that was owed; a cheaper payment, or a payment in
 * another currency, must not settle it.
 */
export function razorpayPaymentMatchesOrder(
  order: { grand_total: number | string; currency: string },
  payment: { amount: number; currency: string }
): boolean {
  if (String(order.currency).toUpperCase() !== String(payment.currency).toUpperCase()) {
    return false;
  }
  return payment.amount === toRazorpayMinorUnit(order.grand_total, order.currency);
}
