import { INVALID_PAYLOAD } from '../../../../lib/util/httpStatus.js';
import type { EvershopRequest } from '../../../../types/request.js';
import { reviewDesign, type ReviewAction } from '../../services/designs.js';
import { sendError, sendFailure, sendOk } from '../../services/http.js';
import { ownDesign } from '../../services/present.js';

const ACTIONS: ReviewAction[] = ['approve', 'reject', 'hide', 'restore'];

export default async function adminReviewDesign(request: EvershopRequest, response, next) {
  try {
    const action = request.body?.action;
    if (!ACTIONS.includes(action)) {
      sendError(response, INVALID_PAYLOAD, 'Choose approve, reject, hide or restore.');
      return;
    }
    const raw = request.body?.note;
    const note = typeof raw === 'string' && raw.trim() ? raw.trim().slice(0, 1000) : null;
    const design = await reviewDesign(String(request.params.id), action, note);
    sendOk(response, ownDesign(design));
  } catch (failure) {
    sendFailure(response, failure);
  }
}
