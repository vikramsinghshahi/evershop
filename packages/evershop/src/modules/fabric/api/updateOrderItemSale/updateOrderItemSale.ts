import { select, update } from '@evershop/postgres-query-builder';
import { pool } from '../../../../lib/postgres/connection.js';
import {
  INTERNAL_SERVER_ERROR,
  INVALID_PAYLOAD,
  NOT_FOUND,
  OK
} from '../../../../lib/util/httpStatus.js';
import { EvershopRequest } from '../../../../types/request.js';
import { EvershopResponse } from '../../../../types/response.js';
import {
  isSaleUnit,
  normalizeSaleFields,
  parseMoq
} from '../../services/saleUnit.js';

export default async (
  request: EvershopRequest,
  response: EvershopResponse,
  next
) => {
  try {
    const item = await select('order_item_id')
      .from('order_item')
      .where('uuid', '=', request.params.uuid as string)
      .load(pool);
    if (!item) {
      response.status(NOT_FOUND);
      response.json({
        error: { status: NOT_FOUND, message: 'Order item not found' }
      });
      return;
    }

    const body = (request.body ?? {}) as { sale_unit?: unknown; moq?: unknown };
    if (body.sale_unit != null && body.sale_unit !== '' && !isSaleUnit(body.sale_unit)) {
      response.status(INVALID_PAYLOAD);
      response.json({
        error: { status: INVALID_PAYLOAD, message: 'Choose a selling unit' }
      });
      return;
    }

    const fields: Record<string, unknown> = {
      sale_unit: body.sale_unit,
      moq: body.moq
    };
    normalizeSaleFields(fields);
    await update('order_item')
      .given({
        sale_unit: fields.sale_unit,
        moq: fields.moq
      })
      .where('order_item_id', '=', item.order_item_id)
      .execute(pool);

    response.status(OK);
    response.json({
      data: {
        saleUnit: fields.sale_unit,
        moq: parseMoq(fields.moq)
      }
    });
  } catch (e) {
    const status = (e as { status?: number }).status ?? INTERNAL_SERVER_ERROR;
    response.status(status);
    response.json({ error: { status, message: (e as Error).message } });
  }
};
