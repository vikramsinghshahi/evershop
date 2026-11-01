import { describe, expect, it } from '@jest/globals';
import { ApplyFabricError } from '../../services/applyFabric.js';
import { readApplyFabricProduct } from '../../services/applyFabricSource.js';
import {
  APPLY_FABRIC_PRODUCT_CHOICES,
  APPLY_FABRIC_PRODUCTS,
  DEFAULT_APPLY_FABRIC_PRODUCT_ID,
  applyFabricProductMessage,
  applyFabricProductPreview,
  findApplyFabricProduct
} from '../../services/applyFabricProducts.js';

describe('apply fabric products', () => {
  it('offers the bag, the dress, the T-shirt, and kids, with the bag first', () => {
    expect(APPLY_FABRIC_PRODUCTS.map((item) => item.id)).toEqual([
      'bag',
      'dress',
      'tshirt',
      'kids'
    ]);
    expect(APPLY_FABRIC_PRODUCTS.map((item) => item.name)).toEqual([
      'Bag',
      'Dress',
      'T-shirt',
      'Kids'
    ]);
    expect(APPLY_FABRIC_PRODUCTS.map((item) => item.image)).toEqual([
      '/apply-fabric/bag.webp',
      '/apply-fabric/dress.webp',
      '/apply-fabric/tshirt.webp',
      '/apply-fabric/kids.webp'
    ]);
    expect(DEFAULT_APPLY_FABRIC_PRODUCT_ID).toBe('bag');
  });

  it('accepts each product id in any case and with surrounding spaces', () => {
    expect(findApplyFabricProduct('bag')?.id).toBe('bag');
    expect(findApplyFabricProduct(' BAG ')?.id).toBe('bag');
    expect(findApplyFabricProduct('Dress')?.id).toBe('dress');
    expect(findApplyFabricProduct('tshirt')?.id).toBe('tshirt');
    expect(findApplyFabricProduct(' KIDS ')?.id).toBe('kids');
  });

  it('rejects a missing product and any other value', () => {
    const rejected = [
      undefined,
      null,
      '',
      '   ',
      'shirt',
      't-shirt',
      'kids.png',
      '/apply-fabric/kids.png',
      '/apply-fabric/bag.jpg',
      '../bag',
      'bag/../../etc/passwd',
      1,
      0,
      12,
      { id: 'bag' },
      ['bag']
    ];
    for (const value of rejected) {
      expect(findApplyFabricProduct(value)).toBeNull();
    }
    expect(applyFabricProductMessage(undefined)).toBe('Choose a product.');
    expect(applyFabricProductMessage(null)).toBe('Choose a product.');
    expect(applyFabricProductMessage('')).toBe('Choose a product.');
    expect(applyFabricProductMessage('  ')).toBe('Choose a product.');
    expect(applyFabricProductMessage('shirt')).toBe(APPLY_FABRIC_PRODUCT_CHOICES);
    expect(applyFabricProductMessage(12)).toBe(APPLY_FABRIC_PRODUCT_CHOICES);
    expect(applyFabricProductMessage('/apply-fabric/dress.jpg')).toBe(
      APPLY_FABRIC_PRODUCT_CHOICES
    );
  });

  it('builds a resized preview only for the shipped product files', () => {
    expect(applyFabricProductPreview('/apply-fabric/bag.webp', 160)).toBe(
      '/images?src=public%2Fapply-fabric%2Fbag.webp&w=160&q=70'
    );
    expect(applyFabricProductPreview('/apply-fabric/dress.webp', 0)).toBeNull();
    expect(applyFabricProductPreview('/apply-fabric/dress.webp', 20.5)).toBeNull();
    expect(applyFabricProductPreview('https://example.com/bag.jpg', 160)).toBeNull();
    expect(applyFabricProductPreview('/assets/catalog/1/secret.jpg', 160)).toBeNull();
    expect(applyFabricProductPreview('/apply-fabric/kids.webp', 160)).toBe(
      '/images?src=public%2Fapply-fabric%2Fkids.webp&w=160&q=70'
    );
    expect(applyFabricProductPreview('/apply-fabric/kids.png', 160)).toBeNull();
    expect(applyFabricProductPreview('/apply-fabric/other.jpg', 160)).toBeNull();
  });

  it('loads the bag photo and refuses every other product', async () => {
    const bag = await readApplyFabricProduct('bag');
    expect(bag.length).toBeGreaterThan(1000);
    const dress = await readApplyFabricProduct(' dress ');
    expect(dress.length).toBeGreaterThan(1000);
    const shirt = await readApplyFabricProduct('TSHIRT');
    expect(shirt.length).toBeGreaterThan(1000);
    expect(bag.equals(dress)).toBe(false);
    expect(bag.equals(shirt)).toBe(false);

    const kids = await readApplyFabricProduct('kids');
    expect(kids.length).toBeGreaterThan(1000);
    expect(bag.equals(kids)).toBe(false);

    await expect(readApplyFabricProduct(undefined)).rejects.toThrow('Choose a product.');
    await expect(readApplyFabricProduct('')).rejects.toThrow('Choose a product.');
    await expect(readApplyFabricProduct('shirt')).rejects.toBeInstanceOf(ApplyFabricError);
    await expect(readApplyFabricProduct(8)).rejects.toThrow(APPLY_FABRIC_PRODUCT_CHOICES);
    await expect(readApplyFabricProduct('/apply-fabric/bag.jpg')).rejects.toThrow(
      APPLY_FABRIC_PRODUCT_CHOICES
    );
  });
});
