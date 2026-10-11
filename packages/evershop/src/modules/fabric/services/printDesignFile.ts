import fs from 'fs/promises';
import path from 'path';
import { CONSTANTS } from '../../../lib/helpers.js';
import { normalizeUploadedDesignUrl } from './printDesign.js';
import { PrintScaleError, resolvePrintConfiguration } from './printScale.js';

/**
 * Server-only. The storefront bundle must not import this file: it reads
 * the media directory.
 */
export function uploadedDesignFilePath(image: string): string | null {
  const url = normalizeUploadedDesignUrl(image);
  if (!url) {
    return null;
  }
  const fileName = url.slice('/assets/fabric-designs/'.length);
  return path.join(CONSTANTS.MEDIAPATH, 'fabric-designs', fileName);
}

export async function uploadedDesignExists(image: string): Promise<boolean> {
  const filePath = uploadedDesignFilePath(image);
  if (!filePath) {
    return false;
  }
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Cart snapshot for a fabric line. Confirms an uploaded file is still in
 * the media folder. Catalog designs are copied from the server catalog.
 */
export async function resolveFabricCartOptions(sku: string, raw: unknown): Promise<string | null> {
  const config = resolvePrintConfiguration(sku, raw);
  if (!config) {
    return null;
  }
  const design = (JSON.parse(config) as { design?: { source?: string; image?: string } }).design;
  if (design?.source === 'upload') {
    const image = design.image || '';
    if (!(await uploadedDesignExists(image))) {
      throw new PrintScaleError(
        'That uploaded design is no longer available. Upload it again.'
      );
    }
  }
  return config;
}
