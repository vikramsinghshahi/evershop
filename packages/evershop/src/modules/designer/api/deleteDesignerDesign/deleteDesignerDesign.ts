import type { EvershopRequest } from '../../../../types/request.js';
import { deleteDesign } from '../../services/designs.js';
import { currentDesigner, sendFailure, sendOk } from '../../services/http.js';

export default async function deleteDesignerDesign(request: EvershopRequest, response, next) {
  try {
    const profile = await currentDesigner(request, response);
    if (!profile) {
      return;
    }
    await deleteDesign(profile, String(request.params.id));
    sendOk(response, { deleted: true });
  } catch (failure) {
    sendFailure(response, failure);
  }
}
