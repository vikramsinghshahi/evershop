import type { EvershopRequest } from '../../../../types/request.js';
import { updateDesignDetails } from '../../services/designs.js';
import { currentDesigner, sendFailure, sendOk } from '../../services/http.js';
import { ownDesign } from '../../services/present.js';

export default async function updateDesignerDesign(request: EvershopRequest, response, next) {
  try {
    const profile = await currentDesigner(request, response);
    if (!profile) {
      return;
    }
    const design = await updateDesignDetails(profile, String(request.params.id), request.body);
    sendOk(response, ownDesign(design));
  } catch (failure) {
    sendFailure(response, failure);
  }
}
