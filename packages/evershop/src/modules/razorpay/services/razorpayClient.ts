import { getConfig } from '../../../lib/util/getConfig.js';
import { getSetting } from '../../setting/services/setting.js';
import { toRazorpayMinorUnit } from './razorpayAmount.js';

const RAZORPAY_API = 'https://api.razorpay.com/v1';

export class RazorpayPaymentError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'RazorpayPaymentError';
    this.status = status;
  }
}

export type RazorpayCredentials = {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
};

export type RazorpayPayment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  notes?: unknown;
};

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  notes?: unknown;
};

export type RazorpayRefund = {
  id: string;
  amount: number;
  currency?: string;
  payment_id?: string;
  status?: string;
};

export async function getRazorpayCredentials(): Promise<RazorpayCredentials> {
  const configured = getConfig('system.razorpay', {}) ?? {};
  const keyId = configured.keyId
    ? String(configured.keyId)
    : await getSetting('razorpayKeyId', '');
  const keySecret = configured.keySecret
    ? String(configured.keySecret)
    : await getSetting('razorpayKeySecret', '');
  const webhookSecret = configured.webhookSecret
    ? String(configured.webhookSecret)
    : await getSetting('razorpayWebhookSecret', '');
  return { keyId, keySecret, webhookSecret };
}

export async function requireRazorpayKeys(): Promise<RazorpayCredentials> {
  const credentials = await getRazorpayCredentials();
  if (!credentials.keyId || !credentials.keySecret) {
    throw new RazorpayPaymentError('Razorpay is not configured.', 503);
  }
  return credentials;
}

type RazorpayRequest = {
  method: 'GET' | 'POST';
  path: string;
  keyId: string;
  keySecret: string;
  body?: Record<string, unknown>;
};

export async function razorpayRequest<T>({
  method,
  path,
  keyId,
  keySecret,
  body
}: RazorpayRequest): Promise<T> {
  const response = await fetch(`${RAZORPAY_API}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000)
  });
  const payload = (await response.json().catch(() => ({}))) as {
    error?: { description?: string };
  };
  if (!response.ok) {
    throw new RazorpayPaymentError(
      payload.error?.description || 'Razorpay request failed.',
      response.status >= 500 ? 502 : 400
    );
  }
  return payload as T;
}

export async function createRazorpayOrder(
  credentials: RazorpayCredentials,
  amount: number,
  receipt: string,
  evershopOrderId: string
): Promise<RazorpayOrder> {
  return razorpayRequest<RazorpayOrder>({
    method: 'POST',
    path: '/orders',
    keyId: credentials.keyId,
    keySecret: credentials.keySecret,
    body: {
      amount,
      currency: 'INR',
      receipt,
      notes: { evershop_order_id: evershopOrderId }
    }
  });
}

export async function fetchRazorpayOrder(
  credentials: RazorpayCredentials,
  razorpayOrderId: string
): Promise<RazorpayOrder> {
  return razorpayRequest<RazorpayOrder>({
    method: 'GET',
    path: `/orders/${encodeURIComponent(razorpayOrderId)}`,
    keyId: credentials.keyId,
    keySecret: credentials.keySecret
  });
}

export async function fetchRazorpayPayment(
  credentials: RazorpayCredentials,
  paymentId: string
): Promise<RazorpayPayment> {
  return razorpayRequest<RazorpayPayment>({
    method: 'GET',
    path: `/payments/${encodeURIComponent(paymentId)}`,
    keyId: credentials.keyId,
    keySecret: credentials.keySecret
  });
}

/**
 * A test payment often returns `authorized`. Capturing it here is what marks
 * the money as taken. Capturing an already-captured payment is a no-op.
 */
export async function ensureRazorpayCaptured(
  credentials: RazorpayCredentials,
  payment: RazorpayPayment
): Promise<RazorpayPayment> {
  if (payment.status === 'captured') {
    return payment;
  }
  if (payment.status !== 'authorized') {
    throw new RazorpayPaymentError(
      `Payment is ${payment.status || 'unpaid'}.`
    );
  }
  try {
    return await razorpayRequest<RazorpayPayment>({
      method: 'POST',
      path: `/payments/${encodeURIComponent(payment.id)}/capture`,
      keyId: credentials.keyId,
      keySecret: credentials.keySecret,
      body: { amount: payment.amount, currency: payment.currency }
    });
  } catch (error) {
    const again = await fetchRazorpayPayment(credentials, payment.id);
    if (again.status === 'captured') {
      return again;
    }
    throw error;
  }
}

export async function refundRazorpayPayment(
  credentials: RazorpayCredentials,
  paymentId: string,
  amount: number | string,
  currency: string
): Promise<RazorpayRefund> {
  return razorpayRequest<RazorpayRefund>({
    method: 'POST',
    path: `/payments/${encodeURIComponent(paymentId)}/refund`,
    keyId: credentials.keyId,
    keySecret: credentials.keySecret,
    body: { amount: toRazorpayMinorUnit(amount, currency) }
  });
}
