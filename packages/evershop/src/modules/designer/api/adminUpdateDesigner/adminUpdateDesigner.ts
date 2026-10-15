import { INVALID_PAYLOAD } from '../../../../lib/util/httpStatus.js';
import type { EvershopRequest } from '../../../../types/request.js';
import { DESIGNER_STATUSES, type DesignerStatus } from '../../services/designerRules.js';
import { sendError, sendFailure, sendOk } from '../../services/http.js';
import { ownProfile } from '../../services/present.js';
import { adminUpdateProfile, type AdminProfileChange } from '../../services/profiles.js';

export default async function adminUpdateDesigner(request: EvershopRequest, response, next) {
  try {
    const body = request.body ?? {};
    const change: AdminProfileChange = {};
    if (body.status !== undefined) {
      if (!(DESIGNER_STATUSES as readonly string[]).includes(body.status)) {
        sendError(response, INVALID_PAYLOAD, 'Unknown designer status.');
        return;
      }
      change.status = body.status as DesignerStatus;
    }
    if (body.note !== undefined) {
      change.note = typeof body.note === 'string' && body.note.trim() ? body.note.trim().slice(0, 500) : null;
    }
    if (body.commissionRate !== undefined) {
      if (body.commissionRate === null || body.commissionRate === '') {
        change.commissionRate = null;
      } else {
        const rate = Number(body.commissionRate);
        if (!Number.isFinite(rate) || rate < 0 || rate > 50) {
          sendError(response, INVALID_PAYLOAD, 'Commission rate must be between 0 and 50 percent.');
          return;
        }
        change.commissionRate = Math.round(rate * 100) / 100;
      }
    }
    if (typeof body.slug === 'string') {
      change.slug = body.slug;
    }
    if (change.status === 'suspended' && !change.note) {
      sendError(response, INVALID_PAYLOAD, 'Give the designer a reason for the suspension.');
      return;
    }
    const profile = await adminUpdateProfile(String(request.params.id), change);
    sendOk(response, ownProfile(profile));
  } catch (failure) {
    sendFailure(response, failure);
  }
}
