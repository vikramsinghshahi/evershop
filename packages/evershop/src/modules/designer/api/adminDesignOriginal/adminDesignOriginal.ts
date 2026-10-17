import { NOT_FOUND } from '../../../../lib/util/httpStatus.js';
import type { EvershopRequest } from '../../../../types/request.js';
import { designByUuid, openDesignOriginal } from '../../services/designs.js';
import { sendError, sendFailure } from '../../services/http.js';

function downloadName(name: string, sku: string | null, file: string): string {
  const extension = file.split('.').pop() || 'png';
  const base = `${sku ? `${sku} ` : ''}${name}`
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
  return `${base || 'design'}.${extension}`;
}

/** The full-resolution print file. Admin only; it is never served from /assets. */
export default async function adminDesignOriginal(request: EvershopRequest, response, next) {
  try {
    const design = await designByUuid(String(request.params.id));
    const file = design ? await openDesignOriginal(design) : null;
    if (!design || !file) {
      sendError(response, NOT_FOUND, 'The print file for this design was not found.');
      return;
    }
    response.set({
      'Content-Type': file.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${downloadName(
        design.name,
        design.sku,
        design.original_file
      )}"`
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
