import sharp from 'sharp';
import {
  APPLY_FABRIC_MODEL,
  APPLY_FABRIC_URL,
  ApplyFabricError,
  applyFabric,
  applyFabricPayload,
  assertApplyFabricSize,
  parseApplyFabricScale,
  placeDesignAtScale,
  toJpegDataUrl
} from '../../services/applyFabric.js';
import {
  APPLY_FABRIC_LABEL,
  APPLY_FABRIC_PATH,
  insertApplyFabricMenu
} from '../../services/applyFabricMenu.js';
import { localImageCandidates } from '../../services/applyFabricSource.js';

async function swatch(): Promise<Buffer> {
  return sharp({
    create: {
      width: 24,
      height: 16,
      channels: 3,
      background: { r: 180, g: 40, b: 40 }
    }
  })
    .png()
    .toBuffer();
}

describe('apply fabric', () => {
  test('compresses an image to a jpeg data url', async () => {
    const url = await toJpegDataUrl(await swatch());
    expect(url.startsWith('data:image/jpeg;base64,')).toBe(true);
    const decoded = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
    const meta = await sharp(decoded).metadata();
    expect(meta.format).toBe('jpeg');
  });

  test('sends the fabric first and the product second', async () => {
    const fabric = await toJpegDataUrl(await swatch());
    const garment = await toJpegDataUrl(await swatch());
    const payload = applyFabricPayload(fabric, garment);
    expect(payload.model).toBe(APPLY_FABRIC_MODEL);
    expect(payload.input_references).toHaveLength(2);
    expect(payload.input_references[0].image_url.url).toBe(fabric);
    expect(payload.input_references[1].image_url.url).toBe(garment);
    expect(payload.prompt).toContain('Preserve the garment silhouette');
    expect(payload.prompt).toContain('100%');
  });

  test('names the chosen scale in the request', () => {
    const payload = applyFabricPayload('data:image/jpeg;base64,YQ==', 'data:image/jpeg;base64,Yg==', 20);
    expect(payload.prompt).toContain('20%');
    expect(payload.prompt).toContain('across the whole garment');
  });

  test('rejects a request body over 7 MB', () => {
    expect(() => assertApplyFabricSize(7 * 1024 * 1024 + 1)).toThrow(ApplyFabricError);
  });

  test('returns the generated image', async () => {
    const png = await swatch();
    const encoded = png.toString('base64');
    const calls: Array<{ url: string; body: string; authorization: string }> = [];
    const fetchImpl = async (
      url: string,
      init: { body: string; headers: Record<string, string> }
    ) => {
      calls.push({
        url,
        body: init.body,
        authorization: init.headers.Authorization
      });
      return {
        ok: true,
        status: 200,
        text: async () => '',
        json: async () => ({ data: [{ b64_json: encoded }] })
      };
    };

    const result = await applyFabric(png, png, { apiKey: 'test-key', fetchImpl });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(APPLY_FABRIC_URL);
    expect(calls[0].authorization).toBe('Bearer test-key');
    const sent = JSON.parse(calls[0].body) as { model: string; input_references: unknown[] };
    expect(sent.model).toBe(APPLY_FABRIC_MODEL);
    expect(sent.input_references).toHaveLength(2);
    expect(result.image.equals(png)).toBe(true);
    expect(result.mime).toBe('image/png');
    expect(result.filename).toBe('applied-fabric.png');
  });

  test('reports a missing API key', async () => {
    const png = await swatch();
    const previous = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    await expect(applyFabric(png, png, { apiKey: '' })).rejects.toBeInstanceOf(ApplyFabricError);
    if (previous === undefined) {
      delete process.env.OPENROUTER_API_KEY;
    } else {
      process.env.OPENROUTER_API_KEY = previous;
    }
  });

  test('reads a whole-number scale and rejects the rest', () => {
    expect(parseApplyFabricScale(undefined)).toBe(100);
    expect(parseApplyFabricScale('')).toBe(100);
    expect(parseApplyFabricScale(' 20 ')).toBe(20);
    expect(parseApplyFabricScale(1)).toBe(1);
    expect(parseApplyFabricScale(100)).toBe(100);
    expect(() => parseApplyFabricScale(0)).toThrow(/1 to 100/);
    expect(() => parseApplyFabricScale(101)).toThrow(/1 to 100/);
    expect(() => parseApplyFabricScale(20.5)).toThrow(/1 to 100/);
    expect(() => parseApplyFabricScale('20%')).toThrow(/1 to 100/);
    expect(() => parseApplyFabricScale('none')).toThrow(/1 to 100/);
  });

  test('tiles the artwork across the whole square', async () => {
    const red = await sharp({
      create: { width: 32, height: 64, channels: 3, background: { r: 180, g: 40, b: 40 } }
    })
      .png()
      .toBuffer();
    const source = await sharp({
      create: { width: 64, height: 64, channels: 3, background: { r: 255, g: 255, b: 255 } }
    })
      .composite([{ input: red, left: 0, top: 0 }])
      .png()
      .toBuffer();
    const redRuns = async (scale: number) => {
      const placed = await placeDesignAtScale(source, scale);
      const { data, info } = await sharp(placed).raw().toBuffer({ resolveWithObject: true });
      const y = Math.floor(info.height / 2);
      let runs = 0;
      let inRed = false;
      for (let x = 0; x < info.width; x += 1) {
        const index = (y * info.width + x) * info.channels;
        const redPixel = data[index] > data[index + 2] + 30;
        if (redPixel && !inRed) {
          runs += 1;
        }
        inRed = redPixel;
      }
      const origin = data[y * info.width * info.channels];
      const originBlue = data[y * info.width * info.channels + 2];
      return { runs, startsWithRed: origin > originBlue + 30, width: info.width, height: info.height };
    };
    const full = await redRuns(100);
    const small = await redRuns(20);
    expect(full.width).toBe(1024);
    expect(full.height).toBe(1024);
    expect(full.startsWithRed).toBe(true);
    expect(small.startsWithRed).toBe(true);
    expect(full.runs).toBe(1);
    expect(small.runs).toBeGreaterThan(full.runs);
  });

  test('rejects a response with no image', async () => {
    const png = await swatch();
    const fetchImpl = async () => ({
      ok: true,
      status: 200,
      text: async () => '',
      json: async () => ({ data: [] })
    });
    await expect(applyFabric(png, png, { apiKey: 'test-key', fetchImpl })).rejects.toThrow(
      'did not return an image'
    );
  });
});

describe('apply fabric menu', () => {
  test('places the link after Designs', () => {
    const next = insertApplyFabricMenu([
      { name: 'Fabrics', url: '/fabrics', children: [] },
      { name: 'Designs', url: '/designs', children: [] },
      { name: 'Blog', url: '/blog', children: [] }
    ]);
    expect(next?.map((item) => item.name)).toEqual(['Fabrics', 'Designs', APPLY_FABRIC_LABEL, 'Blog']);
    expect(next?.[2].url).toBe(APPLY_FABRIC_PATH);
  });

  test('does not insert a second link', () => {
    const once = insertApplyFabricMenu([{ name: 'Fabrics', url: '/fabrics', children: [] }]);
    expect(insertApplyFabricMenu(once || [])).toBeNull();
  });
});

describe('apply fabric image paths', () => {
  test('reads a catalog asset from media', () => {
    const candidates = localImageCandidates('/assets/catalog/1/2/cotton.jpeg');
    expect(candidates[0].replace(/\\/g, '/')).toMatch(/media\/catalog\/1\/2\/cotton\.jpeg$/);
  });

  test('rejects a path that leaves the project', () => {
    expect(() => localImageCandidates('/assets/../../etc/passwd')).toThrow(ApplyFabricError);
  });
});
