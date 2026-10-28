import { describe, expect, it } from '@jest/globals';
import {
  FABRICS_PATH,
  isStoreHomeUrl,
  retargetFabricFooter,
  retargetFabricMenus
} from '../../services/fabricPageLink.js';

describe('isStoreHomeUrl', () => {
  it('matches the homepage and a hash on it', () => {
    expect(isStoreHomeUrl('/')).toBe(true);
    expect(isStoreHomeUrl('/#fabrics')).toBe(true);
    expect(isStoreHomeUrl('')).toBe(true);
    expect(isStoreHomeUrl(undefined)).toBe(true);
  });

  it('does not match the fabric catalog', () => {
    expect(isStoreHomeUrl('/fabrics')).toBe(false);
    expect(isStoreHomeUrl('/accessories')).toBe(false);
  });
});

describe('retargetFabricMenus', () => {
  it('points a homepage Fabrics item at the catalog and leaves the rest', () => {
    const next = retargetFabricMenus([
      { name: 'Fabrics', url: '/' },
      { name: 'Designs', url: '/designs' }
    ]);
    expect(next).toEqual([
      { name: 'Fabrics', url: FABRICS_PATH },
      { name: 'Designs', url: '/designs' }
    ]);
  });

  it('leaves a menu that already opens the catalog', () => {
    const menus = [{ name: 'Fabrics', url: '/fabrics' }];
    expect(retargetFabricMenus(menus)).toBeNull();
  });
});

describe('retargetFabricFooter', () => {
  it('points a homepage Fabrics link at the catalog', () => {
    const next = retargetFabricFooter([
      {
        links: [
          { label: 'Fabrics', url: '/' },
          { label: 'Designs', url: '/designs' }
        ]
      }
    ]);
    expect(next?.[0].links?.map((link) => link.url)).toEqual([
      FABRICS_PATH,
      '/designs'
    ]);
  });
});
