import { select } from '@evershop/postgres-query-builder';
import { error } from '../../../../lib/log/logger.js';
import { pool } from '../../../../lib/postgres/connection.js';
import {
  INTERNAL_SERVER_ERROR,
  INVALID_PAYLOAD,
  OK
} from '../../../../lib/util/httpStatus.js';
import { EvershopRequest } from '../../../../types/request.js';
import { EvershopResponse } from '../../../../types/response.js';
import { toRazorpayMinorUnit } from '../../services/razorpayAmount.js';
import {
  createRazorpayOrder,
  RazorpayPaymentError,
  requireRazorpayKeys
} from '../../services/razorpayClient.js';

export default async (
  request: EvershopRequest,
  response: EvershopResponse,
  next
) => {
  try {
    const { order_id } = request.body;
    const order = await select()
      .from('order')
      .where('uuid', '=', order_id)
      .and('payment_method', '=', 'razorpay')
      .and('payment_status', '=', 'pending')
      .load(pool);

    if (!order) {
      response.status(INVALID_PAYLOAD);
      response.json({
        error: { status: INVALID_PAYLOAD, message: 'Invalid order' }
      });
      return;
    }

    const credentials = await requireRazorpayKeys();
    const amount = toRazorpayMinorUnit(order.grand_total, order.currency);
    const razorpayOrder = await createRazorpayOrder(
      credentials,
      amount,
      order.currency,
      String(order.uuid).slice(0, 40),
      order.uuid
    );

    response.status(OK);
    response.json({
      data: {
        keyId: credentials.keyId,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      }
    });
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
        message: 'Could not start the Razorpay payment'
      }
    });
  }
};
