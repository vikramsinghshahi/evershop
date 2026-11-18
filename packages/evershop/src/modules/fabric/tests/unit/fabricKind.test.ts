import { describe, expect, it } from '@jest/globals';
import {
  canonicalizeFabricKindParam,
  fabricKindUrlFix
} from '../../components/FabricKindFilter.js';
import {
  applyFabricKindToUrl,
  fabricKindPattern,
  fabricKindQuery,
  normalizeFabricKind
} from '../../services/fabricKind.js';
import { fabricKindCollectionFilter } from '../../services/fabricKindFilter.js';

describe('normalizeFabricKind', () => {
  it('accepts a known kind in any case', () => {
    expect(normalizeFabricKind('cotton')).toBe('Cotton');
    expect(normalizeFabricKind('  TENCEL ')).toBe('Tencel');
  });

  it('rejects empty, unknown, and a kind with extra words', () => {
    expect(normalizeFabricKind('')).toBeNull();
    expect(normalizeFabricKind('   ')).toBeNull();
    expect(normalizeFabricKind('silk')).toBeNull();
    expect(normalizeFabricKind('Cotton fabric')).toBeNull();
    expect(normalizeFabricKind(null)).toBeNull();
  });
});

describe('fabricKindPattern', () => {
  it('requires a word boundary so a longer word is not a kind', () => {
    expect(fabricKindPattern('Cotton')).toBe(
      '(^|[^[:alnum:]])Cotton([^[:alnum:]]|$)'
    );
  });
});

describe('applyFabricKindToUrl', () => {
  const base =
    'https://shop.test/fabrics?page=3&ob=price&name[operation]=like&name[value]=poplin';

  it('sets the kind, keeps the search and sort, and drops the page', () => {
    const url = applyFabricKindToUrl(base, 'viscose');
    expect(url.searchParams.get('kind')).toBe('Viscose');
    expect(url.searchParams.get('name[value]')).toBe('poplin');
    expect(url.searchParams.get('ob')).toBe('price');
    expect(url.searchParams.get('page')).toBeNull();
  });

  it('clears only the kind', () => {
    const url = applyFabricKindToUrl(`${base}&kind=Cotton&kind=Modal`, null);
    expect(url.searchParams.get('kind')).toBeNull();
    expect(url.searchParams.getAll('kind')).toEqual([]);
    expect(url.searchParams.get('name[value]')).toBe('poplin');
  });

  it('drops an unknown kind instead of filtering on it', () => {
    const url = applyFabricKindToUrl(`${base}&kind=silk`, 'silk');
    expect(url.searchParams.get('kind')).toBeNull();
  });
});

describe('fabricKindQuery', () => {
  it('reads a canonical kind and ignores a non-eq value', () => {
    expect(
      fabricKindQuery([{ key: 'kind', operation: 'eq', value: 'bamboo' }])
    ).toBe('Bamboo');
    expect(
      fabricKindQuery([{ key: 'kind', operation: 'in', value: 'Cotton,Modal' }])
    ).toBeNull();
  });
});

describe('fabricKindUrlFix', () => {
  it('leaves one exact kind in place', () => {
    expect(fabricKindUrlFix('https://shop.test/fabrics?kind=Modal')).toBe('ok');
    expect(fabricKindUrlFix('https://shop.test/fabrics')).toBe('ok');
  });

  it('rewrites spelling without dropping the page', () => {
    expect(fabricKindUrlFix('https://shop.test/fabrics?kind=modal&page=2')).toBe(
      'rewrite'
    );
    const url = canonicalizeFabricKindParam(
      'https://shop.test/fabrics?kind=modal&page=2&name[value]=crepe'
    );
    expect(url.searchParams.get('kind')).toBe('Modal');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('name[value]')).toBe('crepe');
  });

  it('clears a duplicate or an unknown kind', () => {
    expect(
      fabricKindUrlFix('https://shop.test/fabrics?kind=Cotton&kind=Modal')
    ).toBe('clear');
    expect(fabricKindUrlFix('https://shop.test/fabrics?kind=silk')).toBe(
      'clear'
    );
  });
});

describe('fabricKindCollectionFilter', () => {
  function run(value: string, isAdmin = false) {
    const raws: { sql: string; binding: Record<string, string> }[] = [];
    const currentFilters: { key: string; operation: string; value: string }[] =
      [];
    const query = {
      getWhere: () => ({
        addRaw: (
          _link: string,
          sql: string,
          binding: Record<string, string>
        ) => {
          raws.push({ sql, binding });
        }
      })
    };
    fabricKindCollectionFilter.callback.call(
      { isAdmin },
      query,
      'eq',
      value,
      currentFilters
    );
    return { raws, currentFilters };
  }

  it('filters the cloth name for a known kind', () => {
    const { raws, currentFilters } = run('cotton');
    expect(raws).toHaveLength(1);
    expect(raws[0].sql).toContain('product_description.name ~*');
    expect(Object.values(raws[0].binding)).toEqual([fabricKindPattern('Cotton')]);
    expect(currentFilters).toEqual([
      { key: 'kind', operation: 'eq', value: 'Cotton' }
    ]);
  });

  it('does not filter an unknown kind or the admin catalog', () => {
    expect(run('silk').raws).toEqual([]);
    expect(run('Cotton', true).raws).toEqual([]);
    expect(run('Cotton', true).currentFilters).toEqual([]);
  });
});
