import config from 'config';
import { getConfig } from '../../lib/util/getConfig.js';
import { PaymentStatus } from '../../types/order.js';
import { registerPaymentMethod } from '../checkout/services/getAvailablePaymentMethods.js';
import { getSetting } from '../setting/services/setting.js';
import { fromRazorpayMinorUnit } from './services/razorpayAmount.js';
import {
  ensureRazorpayCaptured,
  fetchRazorpayPayment,
  RazorpayPaymentError,
  refundRazorpayPayment,
  requireRazorpayKeys
} from './services/razorpayClient.js';

export default async () => {
  config.util.setModuleDefaults('oms', {
    order: {
      paymentStatus: {
        razorpay_authorized: {
          name: 'Authorized',
          isDefault: false,
          isCancelable: true,
          isCapturable: true,
          isVoidable: true,
          badge: 'warning'
        },
        razorpay_captured: {
          name: 'Captured',
          isDefault: false,
          isCancelable: false,
          isRefundable: true,
          badge: 'success'
        },
        razorpay_failed: {
          name: 'Failed',
          isDefault: false,
          isCancelable: true,
          badge: 'critical'
        },
        razorpay_refunded: {
          name: 'Refunded',
          badge: 'destructive',
          isCancelable: false,
          isDefault: false
        },
        razorpay_partial_refunded: {
          name: 'Partial Refunded',
          badge: 'destructive',
          isCancelable: false,
          isRefundable: true,
          isDefault: false
        }
      },
      psoMapping: {
        'razorpay_authorized:*': 'processing',
        'razorpay_captured:*': 'processing',
        'razorpay_captured:delivered': 'completed',
        'razorpay_failed:*': 'new',
        'razorpay_refunded:*': 'closed',
        'razorpay_partial_refunded:*': 'processing',
        'razorpay_partial_refunded:delivered': 'completed'
      }
    }
  } as {
    order: {
      paymentStatus: Record<string, PaymentStatus>;
      psoMapping: Record<string, string>;
    };
  });

  registerPaymentMethod({
    init: async () => ({
      code: 'razorpay',
      name: await getSetting('razorpayDisplayName', 'Razorpay')
    }),
    validator: async () => {
      const configured = getConfig('system.razorpay', {}) ?? {};
      const status = configured.status
        ? configured.status
        : await getSetting('razorpayPaymentStatus', 0);
      return parseInt(String(status), 10) === 1;
    },
    capture: async ({ order, transaction }) => {
      if (!transaction?.transaction_id) {
        throw new Error('Missing Razorpay payment id to capture');
      }
      const credentials = await requireRazorpayKeys();
      const payment = await fetchRazorpayPayment(
        credentials,
        transaction.transaction_id
      );
      const captured = await ensureRazorpayCaptured(credentials, payment);
      return {
        transactionId: captured.id,
        amount: fromRazorpayMinorUnit(captured.amount, order.currency),
        raw: { id: captured.id, amount: captured.amount, status: captured.status }
      };
    },
    void: async ({ transaction }) => {
      if (!transaction?.transaction_id) {
        throw new Error('Missing Razorpay payment id to void');
      }
      const credentials = await requireRazorpayKeys();
      const payment = await fetchRazorpayPayment(
        credentials,
        transaction.transaction_id
      );
      if (payment.status !== 'authorized') {
        throw new RazorpayPaymentError('Payment is no longer authorized.');
      }
      await refundRazorpayPayment(
        credentials,
        payment.id,
        fromRazorpayMinorUnit(payment.amount, payment.currency),
        payment.currency
      );
    },
    refund: async ({ order, amount, transaction }) => {
      if (!transaction?.transaction_id) {
        throw new Error('Missing Razorpay payment id to refund');
      }
      const credentials = await requireRazorpayKeys();
      const refund = await refundRazorpayPayment(
        credentials,
        transaction.transaction_id,
        amount,
        order.currency
      );
      return {
        transactionId: refund.id,
        amount: fromRazorpayMinorUnit(refund.amount, order.currency),
        raw: { id: refund.id, amount: refund.amount, status: refund.status }
      };
    },
    supportsPartialRefund: true
  });
};
