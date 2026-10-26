import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { select } from '@evershop/postgres-query-builder';
import { CONSTANTS } from '../../../lib/helpers.js';
import { pool } from '../../../lib/postgres/connection.js';
import { getActiveTheme } from '../../../lib/util/getActiveTheme.js';
import { secureFetch } from '../../../lib/util/secureFetch.js';
import { listLiveDesigns, openDesignPreview } from '../../designer/services/designs.js';
import { ApplyFabricError } from './applyFabric.js';

async function readStream(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/** Absolute files under the project that may hold a store image. Rejects traversal. */
export function localImageCandidates(src: string): string[] {
  const collapsed = src.trim().replace(/\/{2,}/g, '/');
  if (!collapsed || collapsed.includes('\0') || collapsed.split(/[/\\]/).includes('..')) {
    throw new ApplyFabricError('That image is not available.');
  }

  let relative = collapsed;
  if (relative.startsWith('/assets/')) {
    relative = relative.slice('/assets/'.length);
  } else if (relative.startsWith('/')) {
    relative = relative.slice(1);
  }
  if (!relative || relative.split(/[/\\]/).includes('..')) {
    throw new ApplyFabricError('That image is not available.');
  }

  const root = path.resolve(CONSTANTS.ROOTPATH);
  const relatives = [
    path.join('media', relative),
    path.join('public', relative)
  ];
  const theme = getActiveTheme();
  if (theme && !theme.includes('..') && !theme.includes('/') && !theme.includes('\\')) {
    relatives.push(path.join('themes', theme, 'public', relative));
  }

  return relatives.map((relativePath) => {
    const resolved = path.resolve(root, relativePath);
    if (resolved !== root && !resolved.startsWith(root + path.sep)) {
      throw new ApplyFabricError('That image is not available.');
    }
    return resolved;
  });
}

export async function readCatalogImage(src: string): Promise<Buffer> {
  if (src.startsWith('http://') || src.startsWith('https://')) {
    const response = await secureFetch(src);
    if (!response.ok) {
      throw new ApplyFabricError('That image could not be loaded.');
    }
    return Buffer.from(await response.arrayBuffer());
  }

  const candidates = localImageCandidates(src);
  for (const file of candidates) {
    try {
      return await readFile(file);
    } catch {
      // Try the next location the store uses for /assets paths.
    }
  }
  throw new ApplyFabricError('That image could not be loaded.');
}

export async function readDesignImage(uuid: string): Promise<Buffer> {
  if (!/^[0-9a-f-]{36}$/i.test(uuid)) {
    throw new ApplyFabricError('Choose a design from the library.');
  }
  const { items } = await listLiveDesigns({ uuid, limit: 1, page: 1 });
  const design = items[0];
  if (!design) {
    throw new ApplyFabricError('That design is no longer available.');
  }
  const stored = await openDesignPreview(design);
  if (stored) {
    return readStream(stored.stream);
  }
  return readCatalogImage(design.image);
}

export async function readProductImage(productId: number): Promise<Buffer> {
  if (!Number.isInteger(productId) || productId < 1) {
    throw new ApplyFabricError('Choose a product.');
  }
  const main = await select('origin_image')
    .from('product_image')
    .where('product_image_product_id', '=', productId)
    .and('is_main', '=', true)
    .load(pool);
  const fallback =
    main?.origin_image
      ? main
      : await select('origin_image')
          .from('product_image')
          .where('product_image_product_id', '=', productId)
          .load(pool);
  const origin = fallback?.origin_image;
  if (typeof origin !== 'string' || !origin.trim()) {
    throw new ApplyFabricError('That product has no image.');
  }
  return readCatalogImage(origin);
}
