import { readPrintFee } from './printFee.js';

/**
 * The three cuts Tex India sells on a fabric page. The first number is the
 * vertical ruler, the second the horizontal ruler. Linear meter is the start.
 */
export const ORDER_SIZES = [
  { id: 'linear', label: 'Linear meter', widthCm: 100, heightCm: 140 },
  { id: 'test', label: 'Test swatch', widthCm: 20, heightCm: 20 },
  { id: 'big', label: 'Big swatch', widthCm: 75, heightCm: 100 }
] as const;

export type OrderSizeId = (typeof ORDER_SIZES)[number]['id'];

/** Used when an admin has not set a swatch price for that fabric. */
const SWATCH_RATIO: Record<'test' | 'big', number> = {
  test: 0.4,
  big: 0.8
};

export function isOrderSize(value: unknown): value is OrderSizeId {
  return ORDER_SIZES.some((size) => size.id === value);
}

export function orderSizeById(id: OrderSizeId) {
  return ORDER_SIZES.find((size) => size.id === id) ?? ORDER_SIZES[0];
}

export function orderSizeLabel(id: OrderSizeId): string {
  const size = orderSizeById(id);
  return `${size.label} ${size.widthCm}×${size.heightCm} cm`;
}

/**
 * Price of one test or big swatch. An admin amount wins. A blank amount is
 * a share of the linear meter price, which is the product price.
 */
export function swatchUnitPrice(
  id: 'test' | 'big',
  linearPrice: unknown,
  stored: unknown
): number {
  const explicit = readPrintFee(stored);
  if (explicit != null) {
    return explicit;
  }
  const linear = readPrintFee(linearPrice) ?? 0;
  return Math.round(linear * SWATCH_RATIO[id] * 100) / 100;
}

type SizePayload = {
  orderSize?: unknown;
  priceLinear?: unknown;
  priceTestSwatch?: unknown;
  priceBigSwatch?: unknown;
};

function sizePayload(raw: unknown): SizePayload {
  if (raw !== null && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as SizePayload;
  }
  return {};
}

/**
 * Fields stored on a swatch line. Linear meter adds nothing, so a plain
 * linear line stays `{ mode: 'plain' }` and keeps the product price.
 * Throws when the shopper sends a size this shop does not sell.
 */
export function orderSizeSnapshot(raw: unknown): {
  orderSize: 'test' | 'big';
  widthCm: number;
  heightCm: number;
  sizePrice: number;
} | null {
  const body = sizePayload(raw);
  if (body.orderSize === undefined || body.orderSize === null || body.orderSize === '') {
    return null;
  }
  if (body.orderSize === 'linear') {
    return null;
  }
  if (body.orderSize !== 'test' && body.orderSize !== 'big') {
    throw new Error('Choose Linear meter, Test swatch, or Big swatch.');
  }
  const size = orderSizeById(body.orderSize);
  const stored = body.orderSize === 'test' ? body.priceTestSwatch : body.priceBigSwatch;
  return {
    orderSize: body.orderSize,
    widthCm: size.widthCm,
    heightCm: size.heightCm,
    sizePrice: swatchUnitPrice(body.orderSize, body.priceLinear, stored)
  };
}

/** Swatch price saved on a line, or null when the line is linear or not a fabric. */
export function sizePriceFromOptions(raw: string | null | undefined): number | null {
  if (!raw) {
    return null;
  }
  try {
    const data = JSON.parse(raw) as { orderSize?: unknown; sizePrice?: unknown };
    if (data.orderSize !== 'test' && data.orderSize !== 'big') {
      return null;
    }
    const price = readPrintFee(data.sizePrice);
    return price != null && price > 0 ? price : null;
  } catch {
    return null;
  }
}

export function orderSizeFromOptions(raw: string | null | undefined): OrderSizeId {
  if (!raw) {
    return 'linear';
  }
  try {
    const data = JSON.parse(raw) as { orderSize?: unknown };
    return isOrderSize(data.orderSize) ? data.orderSize : 'linear';
  } catch {
    return 'linear';
  }
}

/** Blank clears the stored swatch price. Absent leaves it alone. */
export function normalizeOrderSizePrices(data: Record<string, unknown> | null | undefined): void {
  if (!data || typeof data !== 'object') {
    return;
  }
  if ('price_test_swatch' in data) {
    data.price_test_swatch = readPrintFee(data.price_test_swatch);
  }
  if ('price_big_swatch' in data) {
    data.price_big_swatch = readPrintFee(data.price_big_swatch);
  }
}
