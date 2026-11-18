/** Cloth families the fabric listing can narrow by. The word is matched in the product name. */
export const FABRIC_KINDS = [
  'Cotton',
  'Viscose',
  'Bamboo',
  'Modal',
  'Tencel',
  'Polyester'
] as const;

export type FabricKind = (typeof FABRIC_KINDS)[number];

/**
 * The one kind a listing may filter on. Empty, unknown, and look-alike text
 * ("Cotton fabric", "cottons") are not a kind, so they do not filter.
 */
export function normalizeFabricKind(raw: unknown): FabricKind | null {
  if (typeof raw !== 'string') {
    return null;
  }
  const text = raw.trim().toLowerCase();
  if (!text) {
    return null;
  }
  return FABRIC_KINDS.find((kind) => kind.toLowerCase() === text) ?? null;
}

/** A whole word in the cloth name. "Cotton" matches "Cotton Poplin", not "Cottons". */
export function fabricKindPattern(kind: FabricKind): string {
  const escaped = kind.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return `(^|[^[:alnum:]])${escaped}([^[:alnum:]]|$)`;
}

export function fabricKindQuery(
  filters?: { key: string; operation: string; value: string }[]
): FabricKind | null {
  const raw = filters?.find(
    (filter) => filter.key === 'kind' && filter.operation === 'eq'
  )?.value;
  return normalizeFabricKind(raw);
}

/**
 * Set or clear the kind on a listing URL. The name search, sort, and every
 * other param stay. The page goes back to the first page because the list changed.
 */
export function applyFabricKindToUrl(
  currentUrl: string | URL,
  kind: string | null
): URL {
  const url = new URL(currentUrl);
  url.searchParams.delete('kind');
  const canonical = normalizeFabricKind(kind);
  if (canonical) {
    url.searchParams.set('kind', canonical);
  }
  url.searchParams.delete('page');
  return url;
}
