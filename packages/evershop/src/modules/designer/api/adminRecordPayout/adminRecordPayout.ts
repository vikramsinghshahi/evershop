import { INVALID_PAYLOAD } from '../../../../lib/util/httpStatus.js';
import type { EvershopRequest } from '../../../../types/request.js';
import { sendError, sendFailure, sendOk } from '../../services/http.js';
import { recordPayout } from '../../services/ledger.js';

export default async function adminRecordPayout(request: EvershopRequest, response, next) {
  try {
    const { designer, reference, note } = request.body ?? {};
    if (typeof designer !== 'string' || typeof reference !== 'string') {
      sendError(response, INVALID_PAYLOAD, 'Choose a designer and enter the payment reference.');
      return;
    }
    const user = request.getCurrentUser?.() as { email?: string } | undefined;
    const result = await recordPayout(
      designer,
      reference,
      typeof note === 'string' && note.trim() ? note.trim().slice(0, 500) : null,
      user?.email ?? null
    );
    sendOk(response, result);
  } catch (failure) {
    sendFailure(response, failure);
  }
}
