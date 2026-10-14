import {
  INTERNAL_SERVER_ERROR,
  INVALID_PAYLOAD,
  OK
} from '../../../../lib/util/httpStatus.js';
import type { EvershopRequest } from '../../../../types/request.js';
import { ShipSurchargeError } from '../../services/shipSurcharge.js';
import { saveShipSurcharge } from '../../services/shipSurchargeStore.js';

export default async (request: EvershopRequest, response, next) => {
  try {
    const percent = await saveShipSurcharge(request.body?.percent);
    response.status(OK);
    response.json({ data: { percent } });
  } catch (error) {
    const status = error instanceof ShipSurchargeError ? INVALID_PAYLOAD : INTERNAL_SERVER_ERROR;
    response.status(status);
    response.json({
      error: { status, message: (error as Error).message }
    });
  }
};
