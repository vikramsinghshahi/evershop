import { NOT_FOUND } from '../../../../lib/util/httpStatus.js';
import type { EvershopRequest } from '../../../../types/request.js';
import { designByUuid, liveDesign, openDesignPreview } from '../../services/designs.js';
import { sendError, sendFailure } from '../../services/http.js';
import { profileByCustomer } from '../../services/profiles.js';

function isAdmin(request: EvershopRequest): boolean {
  try {
    return Boolean(request.getCurrentUser?.());
  } catch {
    return false;
  }
}

/**
 * The gallery preview. Live designs are public. Drafts are visible only to
 * the designer who owns them and to an admin. The print file is never sent.
 */
export default async function designerPreview(request: EvershopRequest, response, next) {
  try {
    const uuid = String(request.params.id || '');
    const design = await designByUuid(uuid);
    const live = design ? await liveDesign(uuid) : null;
    let allowed = Boolean(live) || isAdmin(request);
    if (design && !allowed) {
      const customer = request.getCurrentCustomer?.() as { customer_id?: number } | undefined;
      const profile = customer?.customer_id ? await profileByCustomer(customer.customer_id) : null;
      allowed = Number(profile?.designer_profile_id) === Number(design.designer_profile_id);
    }
    const file = design && allowed ? await openDesignPreview(design) : null;
    if (!design || !file) {
      sendError(response, NOT_FOUND, 'That design image was not found.');
      return;
    }
    response.set({
      'Content-Type': file.contentType || 'image/webp',
      'Cache-Control': live ? 'public, max-age=86400' : 'private, no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    file.stream.on('error', (failure) => {
      if (!response.headersSent) {
        sendFailure(response, failure);
      } else {
        response.destroy();
      }
    });
    file.stream.pipe(response);
  } catch (failure) {
    sendFailure(response, failure);
  }
}
