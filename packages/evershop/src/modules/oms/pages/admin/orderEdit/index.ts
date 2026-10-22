import { select } from '@evershop/postgres-query-builder';
import { pool } from '../../../../../lib/postgres/connection.js';
import { EvershopRequest } from '../../../../../types/request.js';
import { EvershopResponse } from '../../../../../types/response.js';
import { setPageMetaInfo } from '../../../../cms/services/pageMetaInfo.js';
import { setContextValue } from '../../../../graphql/services/contextHelper.js';

export default async (
  request: EvershopRequest,
  response: EvershopResponse,
  next
) => {
  try {
    const query = select();
    query.from('order');
    query.andWhere('order.uuid', '=', request.params.id);
    const order = await query.load(pool);

    if (order === null) {
      response.status(404);
      next();
    } else {
      setContextValue(request, 'orderId', order.uuid);
      setContextValue(request, 'orderCurrency', order.currency);
      if (order.exchange_rate != null && order.exchange_rate !== '') {
        setContextValue(request, 'orderExchangeRate', Number(order.exchange_rate));
      }
      setPageMetaInfo(request, {
        title: `Order #${order.order_number}`,
        description: `Order #${order.order_number}`
      });
      next();
    }
  } catch (e) {
    next(e);
  }
};
