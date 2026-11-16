import {
  insertOnUpdate,
  PoolClient
} from '@evershop/postgres-query-builder';
import { emit } from '../../../lib/event/emitter.js';
import addOrderActivityLog from '../../oms/services/addOrderActivityLog.js';
import { updatePaymentStatus } from '../../oms/services/updatePaymentStatus.js';
import {
  fromRazorpayMinorUnit,
  razorpayPaymentMatchesOrder
} from './razorpayAmount.js';
import { RazorpayPayment, RazorpayPaymentError } from './razorpayClient.js';
import { readEvershopOrderId } from './razorpayOrderNote.js';

export type RazorpayShopOrder = {
  order_id: number;
  uuid: string;
  payment_method: string | null;
  payment_status: string | null;
  grand_total: string | number;
  currency: string;
};

/**
 * Bind a Razorpay payment to the EverShop order it was created for.
 * `noteOrderId` is the uuid stored on the Razorpay order by this server.
 */
export function assertRazorpayPaymentForOrder(
  order: RazorpayShopOrder,
  payment: RazorpayPayment,
  noteOrderId: string | undefined
): void {
  if (order.payment_method !== 'razorpay') {
    throw new RazorpayPaymentError('Invalid order');
  }
  if (!noteOrderId || noteOrderId !== order.uuid) {
    throw new RazorpayPaymentError('Payment does not match this order');
  }
  if (!razorpayPaymentMatchesOrder(order, payment)) {
    throw new RazorpayPaymentError('Payment amount does not match this order');
  }
}

export function orderIdFromRazorpayNotes(notes: unknown): string | undefined {
  return readEvershopOrderId(notes);
}

/**
 * Record a captured Razorpay payment once. A second delivery (the browser
 * verify and the webhook, or a retry) updates the same transaction row and
 * does not send the order email again.
 */
export async function recordRazorpayCapture(
  connection: PoolClient,
  order: RazorpayShopOrder,
  payment: RazorpayPayment
): Promise<'recorded' | 'already'> {
  const { rows } = await connection.query(
    'SELECT 1 FROM "payment_transaction" WHERE "transaction_id" = $1 AND "payment_transaction_order_id" = $2',
    [payment.id, order.order_id]
  );
  const already = rows.length > 0;
  await insertOnUpdate('payment_transaction', [
    'transaction_id',
    'payment_transaction_order_id'
  ])
    .given({
      amount: fromRazorpayMinorUnit(payment.amount, payment.currency),
      payment_transaction_order_id: order.order_id,
      transaction_id: payment.id,
      transaction_type: 'online',
      payment_action: 'capture'
    })
    .execute(connection);

  if (!already) {
    await updatePaymentStatus(order.order_id, 'razorpay_captured', connection);
    await addOrderActivityLog(
      order.order_id,
      `Payment captured by Razorpay. Transaction ID: ${payment.id}`,
      false,
      connection
    );
    await emit(
      'order_placed',
      { ...order, payment_status: 'razorpay_captured' },
      connection
    );
  }
  return already ? 'already' : 'recorded';
}
