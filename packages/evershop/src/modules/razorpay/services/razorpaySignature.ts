import { createHmac, timingSafeEqual } from 'crypto';

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

/**
 * Checkout sends this signature after the customer pays. It is
 * HMAC-SHA256 of `order_id|payment_id` using the key secret.
 */
export function signRazorpayCheckout(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  keySecret: string
): string {
  return createHmac('sha256', keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
}

export function verifyRazorpayCheckoutSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
  keySecret: string
): boolean {
  if (!razorpayOrderId || !razorpayPaymentId || !signature || !keySecret) {
    return false;
  }
  return safeEqual(
    signRazorpayCheckout(razorpayOrderId, razorpayPaymentId, keySecret),
    signature
  );
}

/**
 * Razorpay signs the raw webhook body with the webhook secret and sends the
 * hex digest in `X-Razorpay-Signature`.
 */
export function signRazorpayWebhook(rawBody: Buffer, webhookSecret: string): string {
  return createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
}

export function verifyRazorpayWebhookSignature(
  rawBody: Buffer,
  signature: string,
  webhookSecret: string
): boolean {
  if (!rawBody || !signature || !webhookSecret) {
    return false;
  }
  return safeEqual(signRazorpayWebhook(rawBody, webhookSecret), signature);
}
