import { fabricKindPattern, normalizeFabricKind } from './fabricKind.js';

type KindQuery = {
  getWhere: () => {
    addRaw: (
      link: string,
      sql: string,
      binding: Record<string, string>
    ) => void;
  };
};

type CurrentFilter = { key: string; operation: string; value: string };

/**
 * Storefront-only name filter. An unknown value, more than one value (`in`),
 * and the admin catalog do not reach this callback's `eq` operation or return
 * before any SQL is added, so other listings stay as they were.
 */
export const fabricKindCollectionFilter = {
  key: 'kind',
  operation: ['eq'],
  callback: function fabricKindFilter(
    this: { isAdmin?: boolean },
    query: KindQuery,
    _operation: string,
    value: string,
    currentFilters: CurrentFilter[]
  ) {
    if (this.isAdmin) {
      return;
    }
    const kind = normalizeFabricKind(value);
    if (!kind) {
      return;
    }
    query.getWhere().addRaw(
      'AND',
      'product_description.name ~* :fabric_kind',
      { fabric_kind: fabricKindPattern(kind) }
    );
    currentFilters.push({
      key: 'kind',
      operation: 'eq',
      value: kind
    });
  }
};

export function appendFabricKindFilter<T>(filters: T[]): T[] {
  if (!Array.isArray(filters)) {
    return filters;
  }
  return [...filters, fabricKindCollectionFilter as T];
}
