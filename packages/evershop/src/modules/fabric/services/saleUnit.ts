/** Selling units a fabric price can be quoted in. Meter is the cloth default. */
export const SALE_UNITS = [
  { value: 'm', label: 'Meter' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'g', label: 'Gram' },
  { value: 'lb', label: 'Pound' },
  { value: 'oz', label: 'Ounce' },
  { value: 'piece', label: 'Piece' }
] as const;

export type SaleUnitCode = (typeof SALE_UNITS)[number]['value'];

const UNIT_CODES = new Set<string>(SALE_UNITS.map((unit) => unit.value));

export function isSaleUnit(value: unknown): value is SaleUnitCode {
  return typeof value === 'string' && UNIT_CODES.has(value);
}

export function saleUnitLabel(unit: string | null | undefined): string {
  return SALE_UNITS.find((entry) => entry.value === unit)?.label ?? '';
}

export function parseMoq(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Blank unit clears both fields. A chosen unit with no minimum becomes 1,
 * so a fabric always has a minimum order in that unit.
 */
export function normalizeSaleFields(data: Record<string, unknown> | null | undefined): void {
  if (!data || typeof data !== 'object') {
    return;
  }
  if ('sale_unit' in data) {
    data.sale_unit = isSaleUnit(data.sale_unit) ? data.sale_unit : null;
  }
  if ('moq' in data) {
    data.moq = parseMoq(data.moq);
  }
  if (isSaleUnit(data.sale_unit) && data.moq == null) {
    data.moq = 1;
  }
  if (!isSaleUnit(data.sale_unit) && 'sale_unit' in data) {
    data.moq = null;
  }
}
