import { describe, expect, it } from '@jest/globals';
import {
  SELL_YOUR_DESIGN_BANNER,
  SELL_YOUR_DESIGN_GUIDES,
  SELL_YOUR_DESIGN_LABEL,
  SELL_YOUR_DESIGN_PATH,
  SELL_YOUR_DESIGN_STEPS,
  SELL_YOUR_DESIGN_TERMS,
  insertSellYourDesignMenu,
  sellYourDesignBanner
} from '../../services/sellYourDesign.js';

describe('sell your design page', () => {
  it('keeps the four steps, the guidelines and the terms', () => {
    expect(SELL_YOUR_DESIGN_STEPS.map((step) => step.id)).toEqual([
      'register',
      'upload',
      'select',
      'earn'
    ]);
    expect(SELL_YOUR_DESIGN_GUIDES).toHaveLength(5);
    expect(SELL_YOUR_DESIGN_TERMS).toHaveLength(6);
    expect(
      [...SELL_YOUR_DESIGN_STEPS, ...SELL_YOUR_DESIGN_GUIDES, ...SELL_YOUR_DESIGN_TERMS].every(
        (item) => item.title.trim() && item.text.trim()
      )
    ).toBe(true);
    expect(SELL_YOUR_DESIGN_STEPS[3].text).toContain('10%');
  });

  it('accepts only the shipped banner', () => {
    expect(sellYourDesignBanner(SELL_YOUR_DESIGN_BANNER)).toBe('/sell-your-design/banner.webp');
    expect(sellYourDesignBanner('/sell-your-design/banner.png')).toBeNull();
    expect(sellYourDesignBanner('design/sell you design banner.png')).toBeNull();
    expect(sellYourDesignBanner('https://example.com/banner.webp')).toBeNull();
    expect(sellYourDesignBanner(undefined)).toBeNull();
  });
});

describe('sell your design menu', () => {
  const existing = [
    { name: 'Fabrics', url: '/fabrics', children: [] },
    { name: 'Apply Fabric', url: '/apply-fabric', children: [] },
    { name: 'How To order', url: '/how-to-order', children: [] },
    { name: 'About Us', url: '/about-us', children: [] }
  ];

  it('places Sell your design after How To order', () => {
    const next = insertSellYourDesignMenu(existing);
    expect(next?.map((item) => item.name)).toEqual([
      'Fabrics',
      'Apply Fabric',
      'How To order',
      SELL_YOUR_DESIGN_LABEL,
      'About Us'
    ]);
    expect(next?.[3].url).toBe(SELL_YOUR_DESIGN_PATH);
  });

  it('places the link after Apply Fabric when How To order is missing', () => {
    const next = insertSellYourDesignMenu([
      { name: 'Apply Fabric', url: '/apply-fabric' },
      { name: 'About Us', url: '/about-us' }
    ]);
    expect(next?.map((item) => item.url)).toEqual([
      '/apply-fabric',
      SELL_YOUR_DESIGN_PATH,
      '/about-us'
    ]);
  });

  it('places the link before About Us when the other anchors are missing', () => {
    const next = insertSellYourDesignMenu([
      { name: 'Fabrics', url: '/fabrics' },
      { name: 'About Us', url: '/about-us' }
    ]);
    expect(next?.map((item) => item.url)).toEqual(['/fabrics', SELL_YOUR_DESIGN_PATH, '/about-us']);
  });

  it('does not insert a second link', () => {
    const once = insertSellYourDesignMenu(existing);
    expect(insertSellYourDesignMenu(once || [])).toBeNull();
    expect(
      insertSellYourDesignMenu([
        {
          name: 'Shop',
          url: '/fabrics',
          children: [{ name: 'Sell', url: SELL_YOUR_DESIGN_PATH }]
        }
      ])
    ).toBeNull();
  });

  it('leaves a menu that is not a list', () => {
    expect(insertSellYourDesignMenu(undefined as unknown as [])).toBeNull();
  });
});
