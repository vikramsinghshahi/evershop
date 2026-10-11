import { normalizeFabricSpec, normalizeFabricSpecs } from '../../services/fabricSpecs.js';

describe('fabric card specs', () => {
  test('keeps a written value and drops a blank one', () => {
    expect(normalizeFabricSpec('  White/RFD  ')).toBe('White/RFD');
    expect(normalizeFabricSpec('   ')).toBeNull();
    expect(normalizeFabricSpec(null)).toBeNull();
    const data: Record<string, unknown> = {
      fabric_color: 'White/RFD',
      fabric_count: '',
      fabric_gsm: ' 70 '
    };
    normalizeFabricSpecs(data);
    expect(data).toEqual({
      fabric_color: 'White/RFD',
      fabric_count: null,
      fabric_gsm: '70'
    });
  });
});
