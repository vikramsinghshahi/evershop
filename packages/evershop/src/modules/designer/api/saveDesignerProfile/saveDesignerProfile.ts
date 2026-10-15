import { INVALID_PAYLOAD } from '../../../../lib/util/httpStatus.js';
import type { EvershopRequest } from '../../../../types/request.js';
import { checkProfileInput } from '../../services/designerRules.js';
import { currentCustomer, sendError, sendFailure, sendOk } from '../../services/http.js';
import { ownProfile } from '../../services/present.js';
import { saveOwnProfile } from '../../services/profiles.js';

export default async function saveDesignerProfile(request: EvershopRequest, response, next) {
  try {
    const customer = currentCustomer(request, response);
    if (!customer) {
      return;
    }
    const input = checkProfileInput(request.body);
    if (!input.ok) {
      sendError(response, INVALID_PAYLOAD, input.message);
      return;
    }
    const profile = await saveOwnProfile(customer.customer_id, input.value);
    sendOk(response, ownProfile(profile));
  } catch (failure) {
    sendFailure(response, failure);
  }
}
