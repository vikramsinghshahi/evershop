import sharp from 'sharp';
import { error as logError } from '../../../lib/log/logger.js';

/**
 * The request exercised in `sample.mjs`: two JPEG data URLs sent to
 * OpenRouter's image endpoint. The first image is the fabric or design.
 * The second is the product the design is applied to.
 */

export const APPLY_FABRIC_MODEL = 'google/gemini-3.1-flash-image';
export const APPLY_FABRIC_URL = 'https://openrouter.ai/api/v1/images';
export const MAX_APPLY_FABRIC_BYTES = 7 * 1024 * 1024;

export class ApplyFabricError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ApplyFabricError';
    this.status = status;
  }
}

const CANVAS_PX = 1024;

export function applyFabricPrompt(scale: number): string {
  return `Apply the fabric shown in the first reference image to the garment shown in the second reference image.

The first image is a square covered edge to edge by a repeating tile of the artwork. Each repeat is ${scale}% of that square's width and height.
Apply that same tiled print across the whole garment, with each repeat kept at that size. Do not place a single copy in the center.

Preserve the garment silhouette, neckline, sleeves, seams, stitching, folds, proportions and camera angle.
Follow the fabric's original color, texture and print.
Keep the original background and lighting unchanged.
Do not redesign the garment or add new accessories.
Produce a realistic garment visualization.`;
}

/**
 * Whole percent from the apply-fabric slider. A missing value is 100%,
 * which fills the frame. Anything else that is not 1–100 is rejected.
 */
export function parseApplyFabricScale(raw: unknown): number {
  if (raw === undefined || raw === null || raw === '') {
    return 100;
  }
  const text = typeof raw === 'number' ? String(raw) : typeof raw === 'string' ? raw.trim() : '';
  if (!/^\d+$/.test(text)) {
    throw new ApplyFabricError('Image scale must be a whole number from 1 to 100.');
  }
  const value = Number(text);
  if (value < 1 || value > 100) {
    throw new ApplyFabricError('Image scale must be a whole number from 1 to 100.');
  }
  return value;
}

/**
 * Repeat the artwork across a square. Each repeat is `scale` percent of
 * the square, cropped to a square the way the tile layout draws it, and
 * the repeats run from edge to edge.
 */
export async function placeDesignAtScale(input: Buffer, scale: number): Promise<Buffer> {
  const percent = parseApplyFabricScale(scale);
  const motif = Math.max(1, Math.round((CANVAS_PX * percent) / 100));
  let tile: Buffer;
  try {
    tile = await sharp(input, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({
        width: motif,
        height: motif,
        fit: 'cover',
        position: 'centre'
      })
      .png()
      .toBuffer();
  } catch {
    throw new ApplyFabricError('That image could not be read. Use a PNG, JPG, or WebP file.');
  }
  const cols = Math.ceil(CANVAS_PX / motif);
  const rows = Math.ceil(CANVAS_PX / motif);
  try {
    const row = await sharp({
      create: {
        width: cols * motif,
        height: motif,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
      .composite(
        Array.from({ length: cols }, (_, col) => ({
          input: tile,
          left: col * motif,
          top: 0
        }))
      )
      .png()
      .toBuffer();
    const sheet = await sharp({
      create: {
        width: cols * motif,
        height: rows * motif,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
      .composite(
        Array.from({ length: rows }, (_, rowIndex) => ({
          input: row,
          left: 0,
          top: rowIndex * motif
        }))
      )
      .png()
      .toBuffer();
    return await sharp(sheet)
      .extract({ left: 0, top: 0, width: CANVAS_PX, height: CANVAS_PX })
      .jpeg({ quality: 75, mozjpeg: true })
      .toBuffer();
  } catch {
    throw new ApplyFabricError('That image could not be read. Use a PNG, JPG, or WebP file.');
  }
}

export async function toJpegDataUrl(input: Buffer): Promise<string> {
  let image: Buffer;
  try {
    image = await sharp(input, { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({
        width: 1024,
        height: 1024,
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 75, mozjpeg: true })
      .toBuffer();
  } catch {
    throw new ApplyFabricError('That image could not be read. Use a PNG, JPG, or WebP file.');
  }
  return `data:image/jpeg;base64,${image.toString('base64')}`;
}

export function applyFabricPayload(fabricDataUrl: string, garmentDataUrl: string, scale = 100) {
  return {
    model: APPLY_FABRIC_MODEL,
    prompt: applyFabricPrompt(scale),
    input_references: [
      { type: 'image_url', image_url: { url: fabricDataUrl } },
      { type: 'image_url', image_url: { url: garmentDataUrl } }
    ]
  };
}

export function assertApplyFabricSize(bytes: number): void {
  if (bytes > MAX_APPLY_FABRIC_BYTES) {
    throw new ApplyFabricError(
      'Those images are too large after compression. Try smaller files.',
      400
    );
  }
}

export interface ApplyFabricResult {
  image: Buffer;
  mime: string;
  filename: string;
}

interface GeneratedImage {
  b64_json?: string;
}

interface GeneratedResponse {
  data?: GeneratedImage[];
}

type FetchLike = (
  url: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body: string;
    signal: AbortSignal;
  }
) => Promise<{
  ok: boolean;
  status: number;
  text: () => Promise<string>;
  json: () => Promise<unknown>;
}>;

function mimeFor(image: Buffer): { mime: string; filename: string } {
  if (image.length >= 3 && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff) {
    return { mime: 'image/jpeg', filename: 'applied-fabric.jpg' };
  }
  if (
    image.length >= 8 &&
    image[0] === 0x89 &&
    image[1] === 0x50 &&
    image[2] === 0x4e &&
    image[3] === 0x47
  ) {
    return { mime: 'image/png', filename: 'applied-fabric.png' };
  }
  if (image.length >= 12 && image.toString('ascii', 0, 4) === 'RIFF' && image.toString('ascii', 8, 12) === 'WEBP') {
    return { mime: 'image/webp', filename: 'applied-fabric.webp' };
  }
  return { mime: 'image/png', filename: 'applied-fabric.png' };
}

export async function applyFabric(
  fabric: Buffer,
  garment: Buffer,
  options?: { apiKey?: string; fetchImpl?: FetchLike; timeoutMs?: number; scale?: number }
): Promise<ApplyFabricResult> {
  const apiKey = options?.apiKey ?? process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new ApplyFabricError(
      'Apply fabric is not configured. Add OPENROUTER_API_KEY to the environment and restart the server.',
      503
    );
  }

  const scale = parseApplyFabricScale(options?.scale ?? 100);
  const body = JSON.stringify(
    applyFabricPayload(
      await toJpegDataUrl(await placeDesignAtScale(fabric, scale)),
      await toJpegDataUrl(garment),
      scale
    )
  );
  assertApplyFabricSize(Buffer.byteLength(body));

  const fetchImpl = options?.fetchImpl ?? fetch;
  const response = await fetchImpl(APPLY_FABRIC_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body,
    signal: AbortSignal.timeout(options?.timeoutMs ?? 120_000)
  });

  if (!response.ok) {
    const detail = (await response.text()).replace(/\s+/g, ' ').trim().slice(0, 240);
    logError(`OpenRouter apply fabric ${response.status}: ${detail || 'empty body'}`);
    if (response.status === 401 || response.status === 403) {
      throw new ApplyFabricError(
        'The design service rejected the API key. Check OPENROUTER_API_KEY.',
        502
      );
    }
    throw new ApplyFabricError('The design could not be applied. Try again.', 502);
  }

  const result = (await response.json()) as GeneratedResponse;
  const encoded = result.data?.[0]?.b64_json;
  if (!encoded) {
    throw new ApplyFabricError('The design service did not return an image.', 502);
  }

  const image = Buffer.from(encoded, 'base64');
  if (image.length === 0) {
    throw new ApplyFabricError('The design service did not return an image.', 502);
  }
  return { image, ...mimeFor(image) };
}
