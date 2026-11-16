import {
  commit,
  getConnection,
  PoolClient,
  rollback,
  startTransaction
} from '@evershop/postgres-query-builder';
import { debug, error } from '../../../../lib/log/logger.js';
import { pool } from '../../../../lib/postgres/connection.js';
import { OrderRow } from '../../../../types/db/index.js';
import { EvershopRequest } from '../../../../types/request.js';
import { EvershopResponse } from '../../../../types/response.js';
import { recordRefund } from '../../../oms/services/recordRefund.js';
import { updatePaymentStatus } from '../../../oms/services/updatePaymentStatus.js';
import addOrderActivityLog from '../../../oms/services/addOrderActivityLog.js';
import { fromRazorpayMinorUnit } from '../../services/razorpayAmount.js';
import {
  ensureRazorpayCaptured,
  fetchRazorpayOrder,
  getRazorpayCredentials,
  RazorpayPayment,
  RazorpayPaymentError
} from '../../services/razorpayClient.js';
import { readEvershopOrderId } from '../../services/razorpayOrderNote.js';
import {
  assertRazorpayPaymentForOrder,
  RazorpayShopOrder,
  recordRazorpayCapture
} from '../../services/recordRazorpayPayment.js';
import { verifyRazorpayWebhookSignature } from '../../services/razorpaySignature.js';
import {
  isHandledRazorpayPaymentEvent,
  isRazorpayRefundEvent
} from '../../services/webhookEvents.js';

type RazorpayEvent = {
  event?: string;
  payload?: {
    payment?: { entity?: RazorpayPayment };
    refund?: {
      entity?: {
        id?: string;
        amount?: number;
        currency?: string;
        payment_id?: string;
      };
    };
  };
};

async function loadOrderForUpdate(
  connection: PoolClient,
  uuid: string | undefined
): Promise<RazorpayShopOrder | undefined> {
  if (!uuid) {
    return undefined;
  }
  const { rows } = await connection.query(
    'SELECT * FROM "order" WHERE "uuid" = $1 FOR UPDATE',
    [uuid]
  );
  return rows[0];
}

async function loadOrderByPaymentForUpdate(
  connection: PoolClient,
  paymentId: string | undefined
): Promise<RazorpayShopOrder | undefined> {
  if (!paymentId) {
    return undefined;
  }
  const { rows } = await connection.query(
    `SELECT o.* FROM "order" o
       JOIN "payment_transaction" pt
         ON pt."payment_transaction_order_id" = o."order_id"
      WHERE pt."transaction_id" = $1
      FOR UPDATE OF o`,
    [paymentId]
  );
  return rows[0];
}

export default async (
  request: EvershopRequest,
  response: EvershopResponse,
  next
) => {
  const signature = request.headers['x-razorpay-signature'];
  const rawBody = Buffer.isBuffer(request.body)
    ? request.body
    : Buffer.from(request.body ?? '');

  let event: RazorpayEvent;
  try {
    const credentials = await getRazorpayCredentials();
    if (
      !verifyRazorpayWebhookSignature(
        rawBody,
        typeof signature === 'string' ? signature : '',
        credentials.webhookSecret
      )
    ) {
      response.status(400).json({ error: { message: 'Invalid signature' } });
      return;
    }
    event = JSON.parse(rawBody.toString('utf8')) as RazorpayEvent;
  } catch (err) {
    error(err);
    response.status(400).json({ error: { message: 'Invalid webhook' } });
    return;
  }

  const eventType = event.event || '';
  if (!isHandledRazorpayPaymentEvent(eventType) && !isRazorpayRefundEvent(eventType)) {
    debug(`Ignoring unhandled Razorpay event ${eventType}`);
    response.json({ received: true });
    return;
  }

  const credentials = await getRazorpayCredentials();
  const incoming = event.payload?.payment?.entity;
  let payment = incoming;
  let noteOrderId: string | undefined;

  if (!isRazorpayRefundEvent(eventType)) {
    if (!incoming?.id || !incoming.order_id) {
      debug(`Razorpay ${eventType}: payment has no order, ignoring`);
      response.json({ received: true });
      return;
    }
    try {
      const razorpayOrder = await fetchRazorpayOrder(
        credentials,
        incoming.order_id
      );
      noteOrderId = readEvershopOrderId(razorpayOrder.notes);
      if (eventType !== 'payment.failed') {
        payment = await ensureRazorpayCaptured(credentials, incoming);
      }
    } catch (err) {
      if (err instanceof RazorpayPaymentError) {
        debug(err.message);
        response.json({ received: true });
        return;
      }
      error(err);
      response.status(400).json({ error: { message: 'Webhook error' } });
      return;
    }
  }

  const connection = await getConnection(pool);
  try {
    await startTransaction(connection);

    if (isRazorpayRefundEvent(eventType)) {
      const refund = event.payload?.refund?.entity;
      const order = await loadOrderByPaymentForUpdate(
        connection,
        refund?.payment_id || payment?.id
      );
      if (
        order &&
        order.payment_method === 'razorpay' &&
        refund?.id &&
        typeof refund.amount === 'number'
      ) {
        await recordRefund(
          {
            order: order as unknown as OrderRow,
            transactionId: refund.id,
            amount: fromRazorpayMinorUnit(
              refund.amount,
              refund.currency || order.currency
            ),
            currency: refund.currency || order.currency,
            raw: { id: refund.id, amount: refund.amount }
          },
          connection
        );
      }
      await commit(connection);
      response.json({ received: true });
      return;
    }

    const order = await loadOrderForUpdate(connection, noteOrderId);
    if (!order || order.payment_method !== 'razorpay' || !payment?.id) {
      debug(`Razorpay ${eventType}: no matching order, ignoring`);
      await commit(connection);
      response.json({ received: true });
      return;
    }

    if (eventType === 'payment.failed') {
      if (order.payment_status === 'pending') {
        await updatePaymentStatus(order.order_id, 'razorpay_failed', connection);
        await addOrderActivityLog(
          order.order_id,
          `Razorpay payment failed. Transaction ID: ${payment.id}`,
          false,
          connection
        );
      }
      await commit(connection);
      response.json({ received: true });
      return;
    }

    assertRazorpayPaymentForOrder(order, payment, noteOrderId);
    await recordRazorpayCapture(connection, order, payment);
    await commit(connection);
    response.json({ received: true });
  } catch (err) {
    await rollback(connection);
    if (err instanceof RazorpayPaymentError) {
      debug(err.message);
      response.json({ received: true });
      return;
    }
    error(err);
    response.status(400).json({ error: { message: 'Webhook error' } });
  }
};
