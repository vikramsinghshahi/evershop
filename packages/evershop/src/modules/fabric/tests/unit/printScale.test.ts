import {
  PrintScaleError,
  parseStoredPrintOptions,
  printPpiForScale,
  printSizeCm,
  printSpanCm,
  resolvePrintConfiguration
} from '../../services/printScale.js';
import { designDownload, normalizeUploadedDesignUrl } from '../../services/printDesign.js';
import { resolveFabricCartOptions } from '../../services/printDesignFile.js';

const fieldFlower = {
  source: 'catalog',
  designId: 'field-flower',
  layout: 'tile',
  rotation: 0
};

describe('fabric print scale', () => {
  test('stores scale, reference PPI and the resulting PPI for a fabric', () => {
    const raw = resolvePrintConfiguration('FABRIC-COTTON-POPLIN', {
      scale: 100,
      design: fieldFlower
    });
    const stored = JSON.parse(raw as string);
    expect(stored).toMatchObject({
      printScale: 100,
      referencePpi: 48,
      printPpi: 48,
      quality: 'poor'
    });
    expect(stored.design).toMatchObject({
      source: 'catalog',
      designId: 'field-flower',
      name: 'Field Flower',
      layout: 'tile',
      rotation: 0
    });
    expect(printPpiForScale(32)).toBe(150);
    expect(printSpanCm()).toBeCloseTo((200 / 48) * 2.54, 5);
    expect(Number(printSizeCm(100).toFixed(1))).toBe(10.6);
    expect(Number(printSizeCm(35).toFixed(1))).toBe(3.7);
    expect(Number(printSizeCm(50).toFixed(1))).toBe(5.3);
    expect(
      JSON.parse(
        resolvePrintConfiguration('FABRIC-COTTON-POPLIN', {
          scale: '32',
          design: { ...fieldFlower, layout: 'mirror', rotation: 90 }
        }) as string
      ).quality
    ).toBe('sharp');
  });

  test('ignores scale and design on a product that is not a fabric', () => {
    expect(resolvePrintConfiguration('CUP-WHITE', 40)).toBeNull();
    expect(resolvePrintConfiguration('CUP-WHITE', 'nope')).toBeNull();
    expect(resolvePrintConfiguration('CUP-WHITE', undefined)).toBeNull();
    expect(
      resolvePrintConfiguration('CUP-WHITE', { scale: 40, design: fieldFlower })
    ).toBeNull();
  });

  test('rejects missing, zero, fractional, out-of-range and non-numeric scales', () => {
    const sku = 'FABRIC-VISCOSE-CUPRO';
    const messages = [undefined, null, '', 0, '0', 101, -4, 1.5, '80%', true, [], {}].map(
      (value) => {
        try {
          resolvePrintConfiguration(sku, value);
          return null;
        } catch (error) {
          return error instanceof PrintScaleError ? error.message : 'other';
        }
      }
    );
    expect(messages.every((message) => typeof message === 'string' && message.length > 0)).toBe(
      true
    );
    expect(messages[3]).toMatch(/cannot be 0%/);
    expect(messages[0]).toMatch(/Choose a print scale/);
    expect(messages[6]).toMatch(/between 1% and 100%/);
    expect(() =>
      resolvePrintConfiguration('FABRIC-VISCOSE-CUPRO', { scale: 40 })
    ).toThrow(/Upload a design or choose one/);
    expect(() =>
      resolvePrintConfiguration('FABRIC-VISCOSE-CUPRO', {
        scale: 40,
        design: { ...fieldFlower, designId: 'missing' }
      })
    ).toThrow(/not in the catalog/);
    expect(() =>
      resolvePrintConfiguration('FABRIC-VISCOSE-CUPRO', {
        scale: 40,
        design: { ...fieldFlower, layout: 'diagonal' }
      })
    ).toThrow(/Choose a layout/);
    expect(() =>
      resolvePrintConfiguration('FABRIC-VISCOSE-CUPRO', {
        scale: 40,
        design: { ...fieldFlower, rotation: 45 }
      })
    ).toThrow(/0, 90, 180, or 270/);
    expect(
      normalizeUploadedDesignUrl(
        '/assets/fabric-designs/11111111-1111-4111-8111-111111111111.png'
      )
    ).toBe('/assets/fabric-designs/11111111-1111-4111-8111-111111111111.png');
    expect(normalizeUploadedDesignUrl('/assets/fabric-designs/../secret.png')).toBeNull();
    expect(normalizeUploadedDesignUrl('https://example.com/a.png')).toBeNull();
  });

  test('accepts a numeric string and keeps a stored line readable', () => {
    const stored = resolvePrintConfiguration('FABRIC-RAYON-MOSS', {
      scale: ' 80 ',
      design: fieldFlower
    });
    expect(parseStoredPrintOptions(stored)?.printScale).toBe(80);
    expect(parseStoredPrintOptions(stored)?.design?.name).toBe('Field Flower');
    expect(parseStoredPrintOptions('{"printScale":80,"printPpi":60,"quality":"poor"}')?.design).toBe(
      null
    );
    expect(parseStoredPrintOptions(null)).toBeNull();
    expect(parseStoredPrintOptions('not-json')).toBeNull();
    expect(parseStoredPrintOptions('{"printScale":"80"}')).toBeNull();
  });

  test('rejects an uploaded design that is not a file this shop saved', async () => {
    await expect(
      resolveFabricCartOptions('FABRIC-COTTON-POPLIN', {
        scale: 40,
        design: {
          source: 'upload',
          image: '/assets/fabric-designs/11111111-1111-4111-8111-111111111111.png',
          name: 'Mine',
          layout: 'brick',
          rotation: 180
        }
      })
    ).rejects.toThrow(/no longer available/);
  });

  test('builds an admin download for a catalog svg and a saved upload', () => {
    const stored = JSON.parse(
      resolvePrintConfiguration('FABRIC-COTTON-POPLIN', {
        scale: 40,
        design: fieldFlower
      }) as string
    );
    const catalog = designDownload(stored.design);
    expect(catalog).toMatchObject({ kind: 'svg', fileName: 'Field Flower.svg' });
    if (catalog?.kind === 'svg') {
      expect(catalog.svg.startsWith('<svg')).toBe(true);
    }

    expect(
      designDownload({
        source: 'upload',
        designId: 'upload',
        name: 'Floral border',
        image: '/en/assets/fabric-designs/11111111-1111-4111-8111-111111111111.png',
        layout: 'tile',
        rotation: 90
      })
    ).toEqual({
      kind: 'file',
      href: '/assets/fabric-designs/11111111-1111-4111-8111-111111111111.png',
      fileName: 'Floral border.png'
    });

    expect(
      designDownload({
        source: 'upload',
        designId: 'upload',
        name: 'Remote',
        image: 'https://example.com/a.png',
        layout: 'center',
        rotation: 0
      })
    ).toBeNull();
  });
});
