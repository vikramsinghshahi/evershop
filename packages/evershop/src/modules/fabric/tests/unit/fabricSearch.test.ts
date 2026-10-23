import { describe, expect, it } from '@jest/globals';
import {
  applyFabricSearchToUrl,
  isFabricsCategoryUrl
} from '../../components/FabricSearch.js';

describe('isFabricsCategoryUrl', () => {
  it('matches the fabrics category and a locale prefix', () => {
    expect(isFabricsCategoryUrl('/fabrics')).toBe(true);
    expect(isFabricsCategoryUrl('/en/fabrics')).toBe(true);
    expect(isFabricsCategoryUrl('/fabrics/')).toBe(true);
  });

  it('does not match other listings', () => {
    expect(isFabricsCategoryUrl('/accessories')).toBe(false);
    expect(isFabricsCategoryUrl('/products')).toBe(false);
    expect(isFabricsCategoryUrl(undefined)).toBe(false);
  });
});

describe('applyFabricSearchToUrl', () => {
  const base = 'https://shop.test/';

  it('sets the name filter and drops the page', () => {
    const url = applyFabricSearchToUrl(`${base}?page=2&ob=price`, 'cotton');
    expect(url.searchParams.get('name[operation]')).toBe('like');
    expect(url.searchParams.get('name[value]')).toBe('cotton');
    expect(url.searchParams.get('page')).toBeNull();
    expect(url.searchParams.get('ob')).toBe('price');
  });

  it('clears the filter when the box is empty and keeps the sort', () => {
    const url = applyFabricSearchToUrl(
      `${base}?name[operation]=like&name[value]=lawn&od=desc`,
      '  '
    );
    expect(url.searchParams.get('name[value]')).toBeNull();
    expect(url.searchParams.get('name[operation]')).toBeNull();
    expect(url.searchParams.get('od')).toBe('desc');
  });
});
