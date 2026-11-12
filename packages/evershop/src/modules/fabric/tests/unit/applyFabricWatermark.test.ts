import sharp from 'sharp';
import { ApplyFabricError } from '../../services/applyFabric.js';
import {
  APPLY_FABRIC_WATERMARK,
  APPLY_FABRIC_WATERMARK_DARK,
  APPLY_FABRIC_WATERMARK_LIGHT,
  applyFabricWatermarkSvg,
  presentApplyFabricImage,
  watermarkApplyFabricImage
} from '../../services/applyFabricWatermark.js';

async function swatch(): Promise<Buffer> {
  return sharp({
    create: {
      width: 360,
      height: 240,
      channels: 3,
      background: { r: 180, g: 40, b: 40 }
    }
  })
    .png()
    .toBuffer();
}

describe('apply fabric watermark', () => {
  test('uses a faint bharattextile stamp', () => {
    const svg = applyFabricWatermarkSvg(360, 240);
    expect(svg).toContain(APPLY_FABRIC_WATERMARK);
    expect(APPLY_FABRIC_WATERMARK_LIGHT).toBeGreaterThan(0);
    expect(APPLY_FABRIC_WATERMARK_LIGHT).toBeLessThanOrEqual(0.16);
    expect(APPLY_FABRIC_WATERMARK_DARK).toBeGreaterThan(0);
    expect(APPLY_FABRIC_WATERMARK_DARK).toBeLessThan(APPLY_FABRIC_WATERMARK_LIGHT);
    expect(svg).toContain(`fill-opacity="${APPLY_FABRIC_WATERMARK_LIGHT}"`);
    expect(svg).toContain(`fill-opacity="${APPLY_FABRIC_WATERMARK_DARK}"`);
  });

  test('changes the picture only slightly and returns a png', async () => {
    const source = await swatch();
    const marked = await watermarkApplyFabricImage(source);
    expect(marked.equals(source)).toBe(false);
    const meta = await sharp(marked).metadata();
    expect(meta.format).toBe('png');
    expect(meta.width).toBe(360);
    expect(meta.height).toBe(240);

    const before = await sharp(source).removeAlpha().raw().toBuffer();
    const after = await sharp(marked).removeAlpha().raw().toBuffer();
    let total = 0;
    for (let index = 0; index < before.length; index += 1) {
      total += Math.abs(before[index] - after[index]);
    }
    const mean = total / before.length;
    expect(mean).toBeGreaterThan(0.15);
    expect(mean).toBeLessThan(18);
  });

  test('presents a data url and never a clean file when the stamp fails', async () => {
    const presented = await presentApplyFabricImage(await swatch());
    expect(presented.filename).toBe('applied-fabric.png');
    expect(presented.image.startsWith('data:image/png;base64,')).toBe(true);

    await expect(watermarkApplyFabricImage(Buffer.alloc(0))).rejects.toBeInstanceOf(ApplyFabricError);
    await expect(presentApplyFabricImage(Buffer.from('not-an-image'))).rejects.toBeInstanceOf(
      ApplyFabricError
    );
  });
});
