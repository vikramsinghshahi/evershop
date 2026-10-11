import { randomUUID } from 'crypto';
import { INTERNAL_SERVER_ERROR, OK } from '../../../../lib/util/httpStatus.js';
import { error } from '../../../../lib/log/logger.js';
import { uploadFile } from '../../../cms/services/uploadFile.js';

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

function designName(original: string): string {
  const name = original
    .replace(/\.[^.]+$/, '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return name || 'Uploaded design';
}

export default async function saveDesign(request, response, next) {
  try {
    const file = request.file;
    const extension = EXTENSIONS[file.mimetype];
    file.filename = `${randomUUID()}${extension}`;
    const [saved] = await uploadFile([file], 'fabric-designs');
    response.status(OK).json({
      data: {
        url: saved.url,
        name: designName(String(file.originalname || ''))
      }
    });
  } catch (uploadError) {
    error(uploadError);
    response.status(INTERNAL_SERVER_ERROR).json({
      error: {
        status: INTERNAL_SERVER_ERROR,
        message: 'The design could not be uploaded.'
      }
    });
  }
}
