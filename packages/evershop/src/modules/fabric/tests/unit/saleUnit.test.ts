import { normalizeSaleFields, saleUnitLabel } from '../../services/saleUnit.js';

describe('sale unit', () => {
  it('labels a meter and ignores an unknown unit', () => {
    expect(saleUnitLabel('m')).toBe('Meter');
    expect(saleUnitLabel('crate')).toBe('');
  });

  it('turns a chosen unit with no minimum into 1, and clears a blank unit', () => {
    const fabric: Record<string, unknown> = { sale_unit: 'kg', moq: '' };
    normalizeSaleFields(fabric);
    expect(fabric).toEqual({ sale_unit: 'kg', moq: 1 });

    const accessory: Record<string, unknown> = { sale_unit: 'none', moq: 4 };
    normalizeSaleFields(accessory);
    expect(accessory).toEqual({ sale_unit: null, moq: null });
  });
});
