import fs from 'fs/promises';
import path from 'path';
import { CONSTANTS } from '../../../lib/helpers.js';
import { storedObjectExists } from '../../cms/services/openStoredObject.js';
import { buildObjectUrl } from '../../cms/services/storage/s3/s3Storage.js';
import { getFileStorageProvider, getS3StorageConfig } from '../../cms/services/storage/storageConfig.js';
import { liveDesign } from '../../designer/services/designs.js';
import { shopDesignImage } from '../../designer/services/present.js';
import { verifyStoredName } from './designFileSign.js';
import { fabricDesignFileRef, normalizeUploadedDesignUrl, type ResolvedDesignerDesign } from './printDesign.js';
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
  if (!url || url.startsWith('http')) {
    return null;
  }
  if (url.startsWith('/assets/fabric-designs/')) {
    return path.join(CONSTANTS.MEDIAPATH, 'fabric-designs', url.slice('/assets/fabric-designs/'.length));
  }
  if (url.startsWith('/assets/')) {
    return path.join(CONSTANTS.MEDIAPATH, url.slice('/assets/'.length));
  }
  return null;
}

async function bucketUrlPrefix(): Promise<string> {
  if (getFileStorageProvider() !== 's3') {
    return '';
  }
  const config = await getS3StorageConfig();
  const sample = buildObjectUrl(config, 'probe.jpg', config.region || undefined);
  return sample.endsWith('/probe.jpg') ? sample.slice(0, -'probe.jpg'.length) : '';
}

export async function uploadedDesignExists(image: string): Promise<boolean> {
  const fabricFile = fabricDesignFileRef(image);
  if (fabricFile) {
    if (!verifyStoredName(fabricFile.name, fabricFile.sig)) {
      return false;
    }
    if (getFileStorageProvider() === 'local') {
      try {
        await fs.access(path.join(CONSTANTS.MEDIAPATH, fabricFile.name));
        return true;
      } catch {
        return false;
      }
    }
    return storedObjectExists(fabricFile.name);
  }
  const filePath = uploadedDesignFilePath(image);
  if (filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  const prefix = await bucketUrlPrefix();
  const url = normalizeUploadedDesignUrl(image, prefix);
  if (!url || !prefix || !url.startsWith(prefix)) {
    return false;
  }
  const key = decodeURIComponent(url.slice(prefix.length));
  return storedObjectExists(key);
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
    image: shopDesignImage(live.uuid, live.image),
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
  const config = resolvePrintConfiguration(sku, raw, designer, await bucketUrlPrefix());
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
