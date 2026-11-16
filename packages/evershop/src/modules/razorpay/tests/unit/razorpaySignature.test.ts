import {
  signRazorpayCheckout,
  signRazorpayWebhook,
  verifyRazorpayCheckoutSignature,
  verifyRazorpayWebhookSignature
} from '../../services/razorpaySignature.js';
import { readEvershopOrderId } from '../../services/razorpayOrderNote.js';
import {
  isHandledRazorpayPaymentEvent,
  isRazorpayRefundEvent
} from '../../services/webhookEvents.js';

const secret = 'test_secret';

describe('razorpay signatures', () => {
  test('accepts the checkout signature Razorpay would send', () => {
    const signature = signRazorpayCheckout('order_1', 'pay_1', secret);
    expect(
      verifyRazorpayCheckoutSignature('order_1', 'pay_1', signature, secret)
    ).toBe(true);
  });

  test('rejects a signature for a different payment', () => {
    const signature = signRazorpayCheckout('order_1', 'pay_1', secret);
    expect(
      verifyRazorpayCheckoutSignature('order_1', 'pay_2', signature, secret)
    ).toBe(false);
  });

  test('rejects a missing secret', () => {
    expect(
      verifyRazorpayCheckoutSignature('order_1', 'pay_1', 'abc', '')
    ).toBe(false);
  });

  test('accepts the webhook signature of the raw body', () => {
    const body = Buffer.from('{"event":"payment.captured"}');
    const signature = signRazorpayWebhook(body, secret);
    expect(verifyRazorpayWebhookSignature(body, signature, secret)).toBe(true);
    expect(
      verifyRazorpayWebhookSignature(Buffer.from('{"event":"other"}'), signature, secret)
    ).toBe(false);
  });
});

describe('razorpay order notes', () => {
  test('reads the order uuid and ignores an empty notes array', () => {
    expect(
      readEvershopOrderId({ evershop_order_id: 'abc-123' })
    ).toBe('abc-123');
    expect(readEvershopOrderId([])).toBeUndefined();
    expect(readEvershopOrderId(null)).toBeUndefined();
  });
});

describe('razorpay webhook events', () => {
  test('settles captured, authorized, and failed payments', () => {
    expect(isHandledRazorpayPaymentEvent('payment.captured')).toBe(true);
    expect(isHandledRazorpayPaymentEvent('payment.authorized')).toBe(true);
    expect(isHandledRazorpayPaymentEvent('payment.failed')).toBe(true);
    expect(isHandledRazorpayPaymentEvent('payment.created')).toBe(false);
  });

  test('treats refund events separately from captures', () => {
    expect(isRazorpayRefundEvent('refund.processed')).toBe(true);
    expect(isRazorpayRefundEvent('payment.captured')).toBe(false);
  });
});
