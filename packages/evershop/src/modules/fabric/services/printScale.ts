import { parseDesignSelection, type StoredDesign } from './printDesign.js';

/**
 * Print scale stored on a cart/order line.
 *
 * 100% prints the artwork at the size of a 48 PPI source file. A lower scale
 * prints that same file smaller, which raises the effective PPI. The number
 * is snapshotted onto the line so a later change to the slider does not
 * rewrite a cart or order that was already saved.
 */
export const FABRIC_SKU_PREFIX = 'FABRIC-';
export const SCALE_MIN = 1;
export const SCALE_MAX = 100;
export const REFERENCE_PPI = 48;
/** Pixel size of the artwork the 48 PPI reference is measured against. */
export const ARTWORK_PX = 200;
const CM_PER_INCH = 2.54;

export const FABRIC_SWATCHES: Record<string, string> = {
  'FABRIC-VISCOSE-CUPRO': '#c4a484',
  'FABRIC-COTTON-POPLIN': '#f3efe4',
  'FABRIC-VISCOSE-MOSS': '#8fa387',
  'FABRIC-COTTON-LAWN': '#d5e4ef',
  'FABRIC-RAYON-MOSS': '#d7a3a3'
};

export type PrintQuality = 'poor' | 'acceptable' | 'sharp';

export class PrintScaleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrintScaleError';
  }
}

export function isFabricSku(sku: unknown): sku is string {
  return typeof sku === 'string' && sku.startsWith(FABRIC_SKU_PREFIX);
}

export function printPpiForScale(scale: number): number {
  return Math.round((REFERENCE_PPI * 100) / scale);
}

/** Centimetres across the artwork when it is printed at 100% scale. */
export function printSpanCm(): number {
  return (ARTWORK_PX / REFERENCE_PPI) * CM_PER_INCH;
}

/** Printed size of the artwork at the given scale, in centimetres. */
export function printSizeCm(scale: number): number {
  return (printSpanCm() * scale) / 100;
}

export function qualityForPpi(ppi: number): PrintQuality {
  if (ppi < 72) {
    return 'poor';
  }
  if (ppi < 150) {
    return 'acceptable';
  }
  return 'sharp';
}

export function qualityLabel(quality: PrintQuality): string {
  if (quality === 'poor') {
    return 'May look soft';
  }
  if (quality === 'acceptable') {
    return 'Acceptable';
  }
  return 'Sharp';
}

type ScaleInput = number | 'absent' | 'invalid';

function parseScaleInput(raw: unknown): ScaleInput {
  if (raw === undefined || raw === null) {
    return 'absent';
  }
  if (typeof raw === 'string' && raw.trim() === '') {
    return 'absent';
  }
  if (typeof raw === 'boolean' || Array.isArray(raw) || (typeof raw === 'object' && raw !== null)) {
    return 'invalid';
  }
  const value = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return 'invalid';
  }
  return value;
}

function scaleFromInput(raw: unknown): unknown {
  if (raw !== null && typeof raw === 'object' && !Array.isArray(raw) && 'scale' in raw) {
    return (raw as { scale?: unknown }).scale;
  }
  return raw;
}

function isPlainPurchase(raw: unknown): boolean {
  return (
    raw !== null &&
    typeof raw === 'object' &&
    !Array.isArray(raw) &&
    (raw as { mode?: unknown }).mode === 'plain'
  );
}

/**
 * JSON saved in `product_custom_options`, or null when the product is not a fabric.
 * `{ mode: 'plain' }` is cloth with no design: scale and design on that payload
 * are ignored. Any other fabric payload still needs a usable scale and design.
 * A non-fabric product ignores all of it, so a cup cannot pick up a print.
 */
export function resolvePrintConfiguration(sku: string, raw: unknown): string | null {
  if (!isFabricSku(sku)) {
    return null;
  }
  if (isPlainPurchase(raw)) {
    return JSON.stringify({ mode: 'plain' });
  }
  const scale = parseScaleInput(scaleFromInput(raw));
  if (scale === 'absent') {
    throw new PrintScaleError(
      'Choose a print scale between 1% and 100% before adding this fabric.'
    );
  }
  if (scale === 'invalid') {
    throw new PrintScaleError('Print scale must be a whole number from 1 to 100.');
  }
  if (scale === 0) {
    throw new PrintScaleError(
      'Print scale cannot be 0%. A 0% scale has no printable size.'
    );
  }
  if (scale < SCALE_MIN || scale > SCALE_MAX) {
    throw new PrintScaleError(
      'Print scale must be between 1% and 100%. 100% is the largest size this artwork can hold.'
    );
  }
  const designInput =
    raw !== null && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as { design?: unknown }).design
      : undefined;
  const design = parseDesignSelection(designInput);
  if (!design.ok) {
    throw new PrintScaleError(design.message);
  }
  const printPpi = printPpiForScale(scale);
  return JSON.stringify({
    printScale: scale,
    referencePpi: REFERENCE_PPI,
    printPpi,
    quality: qualityForPpi(printPpi),
    design: design.design
  });
}

export interface StoredPrintScale {
  printScale: number;
  printPpi: number;
  quality: PrintQuality;
  design: StoredDesign | null;
}

/** True when the line was saved as cloth with no design. */
export function isPlainFabricLine(raw: string | null | undefined): boolean {
  if (!raw) {
    return false;
  }
  try {
    const data = JSON.parse(raw) as { mode?: unknown };
    return data.mode === 'plain';
  } catch {
    return false;
  }
}

export function parseStoredPrintOptions(
  raw: string | null | undefined
): StoredPrintScale | null {
  if (!raw) {
    return null;
  }
  try {
    const data = JSON.parse(raw) as {
      printScale?: unknown;
      printPpi?: unknown;
      design?: StoredDesign;
    };
    if (typeof data.printScale !== 'number' || !Number.isInteger(data.printScale)) {
      return null;
    }
    const printPpi =
      typeof data.printPpi === 'number' && Number.isInteger(data.printPpi)
        ? data.printPpi
        : printPpiForScale(data.printScale);
    const design = data.design;
    const storedDesign =
      design &&
      (design.source === 'catalog' || design.source === 'upload') &&
      typeof design.name === 'string' &&
      typeof design.image === 'string' &&
      typeof design.layout === 'string' &&
      typeof design.rotation === 'number'
        ? design
        : null;
    return {
      printScale: data.printScale,
      printPpi,
      quality: qualityForPpi(printPpi),
      design: storedDesign
    };
  } catch {
    return null;
  }
}
