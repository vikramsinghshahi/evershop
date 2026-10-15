import multer from 'multer';
import { INVALID_PAYLOAD, UNAUTHORIZED } from '../../../../lib/util/httpStatus.js';
import type { EvershopRequest } from '../../../../types/request.js';
import { DESIGN_FILE_TYPES, DESIGN_MAX_FILE_MB } from '../../services/designerRules.js';
import { sendError } from '../../services/http.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: DESIGN_MAX_FILE_MB * 1024 * 1024, files: 1, fields: 20 },
  fileFilter: (request, file, callback) => {
    if (!(DESIGN_FILE_TYPES as readonly string[]).includes(file.mimetype)) {
      callback(new Error('Upload a PNG, JPEG, TIFF or WebP file.'));
      return;
    }
    callback(null, true);
  }
}).single('design');

/** Refuses anonymous uploads before reading a 50 MB body. */
export default function receiveDesignerFile(request: EvershopRequest, response, next) {
  if (!request.getCurrentCustomer?.()) {
    sendError(response, UNAUTHORIZED, 'Sign in to your account first.');
    return;
  }
  upload(request, response, (failure) => {
    if (failure) {
      const message =
        (failure as { code?: string }).code === 'LIMIT_FILE_SIZE'
          ? `The file is larger than ${DESIGN_MAX_FILE_MB} MB.`
          : (failure as Error).message || 'The design could not be uploaded.';
      sendError(response, INVALID_PAYLOAD, message);
      return;
    }
    next();
  });
}
