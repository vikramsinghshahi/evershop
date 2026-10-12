import {
  INTERNAL_SERVER_ERROR,
  INVALID_PAYLOAD,
  OK
} from '../../../../lib/util/httpStatus.js';
import type { EvershopRequest } from '../../../../types/request.js';
import { saveShipCountries, ShipCardError } from '../../services/shipSave.js';

export default async (request: EvershopRequest, response, next) => {
  try {
    await saveShipCountries(request.body?.countries);
    response.status(OK);
    response.json({ data: { ok: true } });
  } catch (error) {
    const status = error instanceof ShipCardError ? INVALID_PAYLOAD : INTERNAL_SERVER_ERROR;
    response.status(status);
    response.json({
      error: { status, message: (error as Error).message }
    });
  }
};
