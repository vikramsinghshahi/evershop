import { INVALID_PAYLOAD } from '../../../../lib/util/httpStatus.js';
import { getMulter } from '../../../cms/services/getMulter.js';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export default function receiveDesign(request, response, next) {
  getMulter().single('design')(request, response, (error) => {
    if (error) {
      response.status(INVALID_PAYLOAD).json({
        error: {
          status: INVALID_PAYLOAD,
          message: error.message || 'The design could not be uploaded.'
        }
      });
      return;
    }
    const file = request.file;
    if (!file) {
      response.status(INVALID_PAYLOAD).json({
        error: {
          status: INVALID_PAYLOAD,
          message: 'Choose an image to upload.'
        }
      });
      return;
    }
    if (!IMAGE_TYPES.has(file.mimetype)) {
      response.status(INVALID_PAYLOAD).json({
        error: {
          status: INVALID_PAYLOAD,
          message: 'Upload a PNG, JPEG, WebP, or GIF image.'
        }
      });
      return;
    }
    next();
  });
}
