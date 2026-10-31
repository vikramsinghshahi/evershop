import { error } from '../../../../lib/log/logger.js';
import {
  INTERNAL_SERVER_ERROR,
  INVALID_PAYLOAD,
  OK
} from '../../../../lib/util/httpStatus.js';
import { getMulter } from '../../../cms/services/getMulter.js';
import { ApplyFabricError, applyFabric, parseApplyFabricScale } from '../../services/applyFabric.js';
import { readApplyFabricProduct, readDesignImage } from '../../services/applyFabricSource.js';

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

interface UploadedImage {
  buffer?: Buffer;
  mimetype?: string;
  size?: number;
}

function field(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function firstFile(files: unknown, name: string): UploadedImage | undefined {
  if (!files || typeof files !== 'object') {
    return undefined;
  }
  const group = (files as Record<string, UploadedImage[]>)[name];
  return Array.isArray(group) ? group[0] : undefined;
}

async function imageFromUpload(file: UploadedImage | undefined, label: string): Promise<Buffer | null> {
  if (!file) {
    return null;
  }
  if (!file.buffer || file.buffer.length === 0) {
    throw new ApplyFabricError(`Choose a ${label} image.`);
  }
  if (!file.mimetype || !IMAGE_TYPES.has(file.mimetype)) {
    throw new ApplyFabricError('Upload a PNG, JPEG, WebP, or GIF image.');
  }
  return file.buffer;
}

function fail(response, status: number, message: string) {
  response.status(status).json({
    error: { status, message }
  });
}

async function generate(request, response) {
  try {
    const files = request.files;
    const body = request.body ?? {};
    const product = await readApplyFabricProduct(body.productKey);
    const fabricUpload = await imageFromUpload(firstFile(files, 'fabric'), 'design');
    const fabric = fabricUpload ?? (field(body.fabricDesignId) ? await readDesignImage(field(body.fabricDesignId)) : null);

    if (!fabric || !product) {
      throw new ApplyFabricError('Choose a design and a product first.');
    }

    const result = await applyFabric(fabric, product, {
      scale: parseApplyFabricScale(body.designScale)
    });
    response.status(OK).json({
      data: {
        image: `data:${result.mime};base64,${result.image.toString('base64')}`,
        filename: result.filename
      }
    });
  } catch (failure) {
    if (failure instanceof ApplyFabricError) {
      fail(response, failure.status || INVALID_PAYLOAD, failure.message);
      return;
    }
    error(failure);
    fail(response, INTERNAL_SERVER_ERROR, 'The design could not be applied. Try again.');
  }
}

export default function applyFabricRoute(request, response, _next) {
  getMulter().fields([{ name: 'fabric', maxCount: 1 }])(request, response, (uploadError) => {
    if (uploadError) {
      const tooLarge = uploadError.code === 'LIMIT_FILE_SIZE';
      const unexpectedFile = uploadError.code === 'LIMIT_UNEXPECTED_FILE';
      fail(
        response,
        INVALID_PAYLOAD,
        tooLarge
          ? 'That image is too large.'
          : unexpectedFile
            ? 'Choose a bag, dress, or T-shirt.'
            : uploadError.message || 'The image could not be uploaded.'
      );
      return;
    }
    generate(request, response).catch((failure) => {
      error(failure);
      if (!response.headersSent) {
        fail(response, INTERNAL_SERVER_ERROR, 'The design could not be applied. Try again.');
      }
    });
  });
}
