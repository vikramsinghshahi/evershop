import path from 'path';
import { createReadStream } from 'fs';
import fs from 'fs/promises';
import { CONSTANTS } from '../../../../lib/helpers.js';
import { NOT_FOUND } from '../../../../lib/util/httpStatus.js';
import type { EvershopRequest } from '../../../../types/request.js';
import { openStoredObject } from '../../../cms/services/openStoredObject.js';
import { getFileStorageProvider } from '../../../cms/services/storage/storageConfig.js';
import { verifyStoredName } from '../../services/designFileSign.js';
import { fabricDesignFileRef } from '../../services/printDesign.js';
import { sendError, sendFailure } from '../../../designer/services/http.js';

const MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif'
};

/** A shopper's fabric upload. The signature is checked before any bucket read. */
export default async function fabricDesignFile(request: EvershopRequest, response, next) {
  try {
    const ref = fabricDesignFileRef(
      `/fabric/design-file?name=${encodeURIComponent(String(request.query.name || ''))}&sig=${encodeURIComponent(String(request.query.sig || ''))}`
    );
    if (!ref || !verifyStoredName(ref.name, ref.sig)) {
      sendError(response, NOT_FOUND, 'That design image was not found.');
      return;
    }
    const extension = ref.name.split('.').pop()?.toLowerCase() || '';
    const contentType = MIME[extension] || 'application/octet-stream';
    if (getFileStorageProvider() === 'local') {
      const filePath = path.join(CONSTANTS.MEDIAPATH, ref.name);
      try {
        await fs.access(filePath);
      } catch {
        sendError(response, NOT_FOUND, 'That design image was not found.');
        return;
      }
      response.set({
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=86400',
        'X-Content-Type-Options': 'nosniff'
      });
      createReadStream(filePath).pipe(response);
      return;
    }
    const object = await openStoredObject(ref.name);
    if (!object) {
      sendError(response, NOT_FOUND, 'That design image was not found.');
      return;
    }
    response.set({
      'Content-Type': object.contentType || contentType,
      'Cache-Control': 'private, max-age=86400',
      'X-Content-Type-Options': 'nosniff'
    });
    object.stream.on('error', (failure) => {
      if (!response.headersSent) {
        sendFailure(response, failure);
      } else {
        response.destroy();
      }
    });
    object.stream.pipe(response);
  } catch (failure) {
    sendFailure(response, failure);
  }
}
