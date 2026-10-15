import { INVALID_PAYLOAD } from '../../../../lib/util/httpStatus.js';
import type { EvershopRequest } from '../../../../types/request.js';
import { submitDesign, withdrawDesign } from '../../services/designs.js';
import { currentDesigner, sendError, sendFailure, sendOk } from '../../services/http.js';
import { ownDesign } from '../../services/present.js';

export default async function designerDesignAction(request: EvershopRequest, response, next) {
  try {
    const profile = await currentDesigner(request, response);
    if (!profile) {
      return;
    }
    const id = String(request.params.id);
    const action = request.body?.action;
    if (action === 'submit') {
      sendOk(response, ownDesign(await submitDesign(profile, id)));
      return;
    }
    if (action === 'withdraw') {
      sendOk(response, ownDesign(await withdrawDesign(profile, id)));
      return;
    }
    sendError(response, INVALID_PAYLOAD, 'Choose submit or withdraw.');
  } catch (failure) {
    sendFailure(response, failure);
  }
}
