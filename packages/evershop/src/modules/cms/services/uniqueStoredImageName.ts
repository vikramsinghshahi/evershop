import fs from 'fs/promises';
import path from 'path';
import { CONSTANTS } from '../../../lib/helpers.js';
import { generateFileName } from './generateFileName.js';
import { storedObjectExists } from './openStoredObject.js';
import { getFileStorageProvider } from './storage/storageConfig.js';

const IMAGE_EXT = /^\.(png|jpe?g|tiff?|webp|gif)$/i;

/**
 * A bucket key that is the picture's own name (`paisley.jpg`), not a folder
 * plus a generated id. The extension comes from the detected file type.
 */
export function storedImageName(originalName: string, extension: string): string {
  const ext = IMAGE_EXT.test(extension) ? extension.toLowerCase().replace(/^\.jpeg$/, '.jpg').replace(/^\.tiff$/, '.tif') : '.png';
  const source = originalName.trim() || `design${ext}`;
  const generated = generateFileName(source.includes('.') ? source : `${source}${ext}`);
  const stem = generated
    .replace(/\.[^.]+$/, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 80);
  return `${/[a-z0-9]/.test(stem) ? stem : 'design'}${ext}`;
}

async function nameTaken(name: string): Promise<boolean> {
  if (getFileStorageProvider() === 'local') {
    try {
      await fs.access(path.join(CONSTANTS.MEDIAPATH, name));
      return true;
    } catch {
      return false;
    }
  }
  return storedObjectExists(name);
}

/** `photo.jpg`, then `photo-2.jpg`, when that name is already stored. */
export async function uniqueStoredImageName(originalName: string, extension: string): Promise<string> {
  const preferred = storedImageName(originalName, extension);
  const dot = preferred.lastIndexOf('.');
  const stem = preferred.slice(0, dot);
  const ext = preferred.slice(dot);
  for (let n = 1; n < 50; n += 1) {
    const candidate = n === 1 ? preferred : `${stem}-${n}${ext}`;
    if (!(await nameTaken(candidate))) {
      return candidate;
    }
  }
  return `${stem}-${Date.now()}${ext}`;
}
