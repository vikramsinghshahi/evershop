import sharp from 'sharp';
import { ApplyFabricError } from './applyFabric.js';

export const APPLY_FABRIC_WATERMARK = 'bharattextile';
/** White stamp. Kept faint so the garment stays readable. */
export const APPLY_FABRIC_WATERMARK_LIGHT = 0.12;
/** Dark stamp, one pixel offset, so the word still reads on a light garment. */
export const APPLY_FABRIC_WATERMARK_DARK = 0.05;

export function applyFabricWatermarkSvg(width: number, height: number): string {
  const fontSize = Math.max(18, Math.round(Math.min(width, height) / 11));
  const stepX = Math.round(fontSize * 8.4);
  const stepY = Math.round(fontSize * 3.6);
  const span = width + height;
  const light: string[] = [];
  const dark: string[] = [];
  const stamp = (x: number, y: number, bucket: string[]) => {
    bucket.push(
      `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${APPLY_FABRIC_WATERMARK}</text>`
    );
  };
  stamp(width / 2, height / 2, light);
  stamp(width / 2 + 1, height / 2 + 1, dark);
  for (let y = -span; y <= span; y += stepY) {
    for (let x = -span; x <= span; x += stepX) {
      stamp(x, y, light);
      stamp(x + 1, y + 1, dark);
    }
  }
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <g fill="#ffffff" fill-opacity="${APPLY_FABRIC_WATERMARK_LIGHT}" font-family="sans-serif" font-size="${fontSize}" font-weight="600" transform="rotate(-28 ${
    width / 2
  } ${height / 2})">${light.join('')}</g>
  <g fill="#1c1917" fill-opacity="${APPLY_FABRIC_WATERMARK_DARK}" font-family="sans-serif" font-size="${fontSize}" font-weight="600" transform="rotate(-28 ${
    width / 2
  } ${height / 2})">${dark.join('')}</g>
</svg>`;
}

async function meanChannelDelta(left: Buffer, right: Buffer): Promise<number> {
  const before = await sharp(left)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const after = await sharp(right)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (
    before.info.width !== after.info.width ||
    before.info.height !== after.info.height ||
    before.data.length !== after.data.length ||
    before.data.length === 0
  ) {
    throw new ApplyFabricError(
      'The design could not be applied. Try again.',
      502
    );
  }
  let total = 0;
  for (let index = 0; index < before.data.length; index += 1) {
    total += Math.abs(before.data[index] - after.data[index]);
  }
  return total / before.data.length;
}

/**
 * Stamps a faint "bharattextile" across the generated image.
 * A failed stamp throws, so the clean image is never returned.
 */
export async function watermarkApplyFabricImage(
  image: Buffer
): Promise<Buffer> {
  try {
    if (!image || image.length === 0) {
      throw new ApplyFabricError(
        'The design service did not return an image.',
        502
      );
    }
    const meta = await sharp(image, { failOn: 'none' }).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    if (width < 1 || height < 1 || width > 4096 || height > 4096) {
      throw new ApplyFabricError(
        'The design could not be applied. Try again.',
        502
      );
    }
    const stamped = await sharp(image, { failOn: 'none' })
      .composite([
        {
          input: Buffer.from(applyFabricWatermarkSvg(width, height)),
          blend: 'over'
        }
      ])
      .png()
      .toBuffer();
    const delta = await meanChannelDelta(image, stamped);
    if (!(delta > 0)) {
      throw new ApplyFabricError(
        'The design could not be applied. Try again.',
        502
      );
    }
    return stamped;
  } catch (failure) {
    if (failure instanceof ApplyFabricError) throw failure;
    throw new ApplyFabricError(
      'The design could not be applied. Try again.',
      502
    );
  }
}

export async function presentApplyFabricImage(
  image: Buffer
): Promise<{ image: string; filename: string }> {
  const marked = await watermarkApplyFabricImage(image);
  return {
    image: `data:image/png;base64,${marked.toString('base64')}`,
    filename: 'applied-fabric.png'
  };
}
