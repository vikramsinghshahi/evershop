import {
  commit,
  getConnection,
  rollback,
  select,
  startTransaction
} from '@evershop/postgres-query-builder';
import { error } from '../../../../lib/log/logger.js';
import { pool } from '../../../../lib/postgres/connection.js';
import {
  INTERNAL_SERVER_ERROR,
  INVALID_PAYLOAD,
  OK
} from '../../../../lib/util/httpStatus.js';
import { EvershopRequest } from '../../../../types/request.js';
import { EvershopResponse } from '../../../../types/response.js';
import {
  ensureRazorpayCaptured,
  fetchRazorpayOrder,
  fetchRazorpayPayment,
  RazorpayPaymentError,
  requireRazorpayKeys
} from '../../services/razorpayClient.js';
import { readEvershopOrderId } from '../../services/razorpayOrderNote.js';
import {
  assertRazorpayPaymentForOrder,
  recordRazorpayCapture
} from '../../services/recordRazorpayPayment.js';
import { verifyRazorpayCheckoutSignature } from '../../services/razorpaySignature.js';

export default async (
  request: EvershopRequest,
  response: EvershopResponse,
  next
) => {
  const {
    order_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = request.body;

  let credentials;
  try {
    credentials = await requireRazorpayKeys();
  } catch (err) {
    if (err instanceof RazorpayPaymentError) {
      response.status(err.status);
      response.json({
        error: { status: err.status, message: err.message }
      });
      return;
    }
    error(err);
    response.status(INTERNAL_SERVER_ERROR);
    response.json({
      error: {
        status: INTERNAL_SERVER_ERROR,
        message: 'Could not confirm the Razorpay payment'
      }
    });
    return;
  }

  if (
    !verifyRazorpayCheckoutSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      credentials.keySecret
    )
  ) {
    response.status(INVALID_PAYLOAD);
    response.json({
      error: {
        status: INVALID_PAYLOAD,
        message: 'Payment could not be verified'
      }
    });
    return;
  }

  const connection = await getConnection(pool);
  try {
    await startTransaction(connection);
    const order = await select()
      .from('order')
      .where('uuid', '=', order_id)
      .load(connection, false);

    if (!order || order.payment_method !== 'razorpay') {
      await rollback(connection);
      response.status(INVALID_PAYLOAD);
      response.json({
        error: { status: INVALID_PAYLOAD, message: 'Invalid order' }
      });
      return;
    }

    if (order.payment_status === 'razorpay_captured') {
      await commit(connection);
      response.status(OK);
      response.json({ data: { paid: true } });
      return;
    }

    const razorpayOrder = await fetchRazorpayOrder(
      credentials,
      razorpay_order_id
    );
    const payment = await ensureRazorpayCaptured(
      credentials,
      await fetchRazorpayPayment(credentials, razorpay_payment_id)
    );
    if (payment.order_id !== razorpayOrder.id) {
      throw new RazorpayPaymentError('Payment does not match this order');
    }
    assertRazorpayPaymentForOrder(
      order,
      payment,
      readEvershopOrderId(razorpayOrder.notes)
    );
    await recordRazorpayCapture(connection, order, payment);
    await commit(connection);
    response.status(OK);
    response.json({ data: { paid: true } });
  } catch (err) {
    await rollback(connection);
    if (err instanceof RazorpayPaymentError) {
      response.status(err.status);
      response.json({
        error: { status: err.status, message: err.message }
      });
      return;
    }
    error(err);
    response.status(INTERNAL_SERVER_ERROR);
    response.json({
      error: {
        status: INTERNAL_SERVER_ERROR,
        message: 'Could not confirm the Razorpay payment'
      }
    });
  }
};
