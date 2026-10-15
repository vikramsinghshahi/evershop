import type { EvershopRequest } from '../../../../types/request.js';
import { createDesign, submitDesign } from '../../services/designs.js';
import { currentDesigner, sendFailure, sendOk } from '../../services/http.js';
import { ownDesign } from '../../services/present.js';

export default async function saveDesignerDesign(request: EvershopRequest, response, next) {
  try {
    const profile = await currentDesigner(request, response);
    if (!profile) {
      return;
    }
    const body = request.body ?? {};
    let design = await createDesign(profile, (request as { file?: any }).file, body);
    // "Upload and submit" in one step. A failed submit keeps the draft.
    let submitError: string | null = null;
    if (body.submit === 'true' || body.submit === true) {
      try {
        design = await submitDesign(profile, design.uuid);
      } catch (failure) {
        submitError = (failure as Error).message;
      }
    }
    sendOk(response, { design: ownDesign(design), submitError });
  } catch (failure) {
    sendFailure(response, failure);
  }
}
