/**
 * Cloth specs shown on a fabric card. Each value is free text so an admin
 * can write "White/RFD" or "145cm". A blank line is stored as null and
 * hidden on the card.
 */
export const FABRIC_SPECS = [
  { column: 'fabric_color', field: 'fabricColor', label: 'Color' },
  { column: 'fabric_count', field: 'fabricCount', label: 'Count' },
  { column: 'fabric_construction', field: 'fabricConstruction', label: 'Cons' },
  { column: 'fabric_width', field: 'fabricWidth', label: 'Width' },
  { column: 'fabric_gsm', field: 'fabricGsm', label: 'GSM' }
] as const;

export type FabricSpecField = (typeof FABRIC_SPECS)[number]['field'];

const MAX_LENGTH = 80;

export function normalizeFabricSpec(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  const text = String(value).trim();
  if (!text) {
    return null;
  }
  return text.slice(0, MAX_LENGTH);
}

export function normalizeFabricSpecs(
  data: Record<string, unknown> | null | undefined
): void {
  if (!data || typeof data !== 'object') {
    return;
  }
  for (const spec of FABRIC_SPECS) {
    if (spec.column in data) {
      data[spec.column] = normalizeFabricSpec(data[spec.column]);
    }
  }
}

export function readFabricSpec(
  row: Record<string, unknown> | null | undefined,
  field: FabricSpecField
): string | null {
  const spec = FABRIC_SPECS.find((entry) => entry.field === field);
  if (!row || !spec) {
    return null;
  }
  return normalizeFabricSpec(row[spec.field] ?? row[spec.column]);
}
