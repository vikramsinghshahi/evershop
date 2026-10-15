import fs from 'fs/promises';
import path from 'path';
import { CONSTANTS } from '../../../lib/helpers.js';
import { liveDesign } from '../../designer/services/designs.js';
import { normalizeUploadedDesignUrl, type ResolvedDesignerDesign } from './printDesign.js';
import {
  isFabricSku,
  isPlainPurchase,
  PrintScaleError,
  resolvePrintConfiguration
} from './printScale.js';

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
 * A designer design must be live right now: approved, and its designer
 * verified with an active account.
 */
async function resolveDesignerDesign(raw: unknown): Promise<ResolvedDesignerDesign | null> {
  const design =
    raw !== null && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as { design?: { source?: unknown; designId?: unknown } }).design
      : undefined;
  if (design?.source !== 'designer' || typeof design.designId !== 'string') {
    return null;
  }
  const live = await liveDesign(design.designId);
  if (!live) {
    throw new PrintScaleError('That design is no longer available. Choose another design.');
  }
  return {
    uuid: live.uuid,
    sku: live.sku,
    name: live.name,
    image: live.image,
    designerName: live.designer_name,
    designerSlug: live.designer_slug
  };
}

/**
 * Cart snapshot for a fabric line. Confirms an uploaded file is still in
 * the media folder. Catalog designs are copied from the server catalog.
 * Designer designs are copied from the live designer catalog.
 */
export async function resolveFabricCartOptions(sku: string, raw: unknown): Promise<string | null> {
  const designer =
    !isFabricSku(sku) || isPlainPurchase(raw) ? null : await resolveDesignerDesign(raw);
  const config = resolvePrintConfiguration(sku, raw, designer);
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
