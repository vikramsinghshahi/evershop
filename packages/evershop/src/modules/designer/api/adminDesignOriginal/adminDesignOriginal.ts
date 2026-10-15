import fs from 'fs';
import { NOT_FOUND } from '../../../../lib/util/httpStatus.js';
import type { EvershopRequest } from '../../../../types/request.js';
import { designByUuid, originalFilePath } from '../../services/designs.js';
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
    const filePath = design ? originalFilePath(design) : null;
    if (!design || !filePath || !fs.existsSync(filePath)) {
      sendError(response, NOT_FOUND, 'The print file for this design was not found.');
      return;
    }
    response.download(filePath, downloadName(design.name, design.sku, design.original_file));
  } catch (failure) {
    sendFailure(response, failure);
  }
}
