import { describe, expect, it } from '@jest/globals';
import { sanitizeNazarBattuSvg } from '../../services/nazarBattuSvg.js';
import branding from '../../graphql/types/BrandingSetting/BrandingSetting.resolvers.js';

const face = '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#111"/></svg>';

describe('sanitizeNazarBattuSvg', () => {
  it('keeps a small shape graphic and adds the svg namespace', () => {
    const clean = sanitizeNazarBattuSvg(face);
    expect(clean).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#111"/></svg>'
    );
  });

  it('treats an empty value as the built-in charm', () => {
    expect(sanitizeNazarBattuSvg('')).toBeNull();
    expect(sanitizeNazarBattuSvg('   ')).toBeNull();
    expect(sanitizeNazarBattuSvg(null)).toBeNull();
  });

  it('rejects scripts, handlers, links, and anything past 2 KB', () => {
    expect(
      sanitizeNazarBattuSvg(
        '<svg viewBox="0 0 10 10"><script>alert(1)</script></svg>'
      )
    ).toBeNull();
    expect(
      sanitizeNazarBattuSvg(
        '<svg viewBox="0 0 10 10"><circle cx="1" cy="1" r="1" onclick="alert(1)"/></svg>'
      )
    ).toBeNull();
    expect(
      sanitizeNazarBattuSvg(
        '<svg viewBox="0 0 10 10"><a href="https://evil.test"><circle cx="1" cy="1" r="1"/></a></svg>'
      )
    ).toBeNull();
    expect(
      sanitizeNazarBattuSvg(
        `<svg viewBox="0 0 10 10"><circle cx="1" cy="1" r="1"/></svg>${'x'.repeat(2048)}`
      )
    ).toBeNull();
  });

  it('allows a rotated group of paths', () => {
    const clean = sanitizeNazarBattuSvg(
      '<svg viewBox="0 0 20 20"><g transform="rotate(12 10 10)"><path d="M1 1 L10 18" stroke="#e07068"/></g></svg>'
    );
    expect(clean).toContain('transform="rotate(12 10 10)"');
    expect(clean).toContain('d="M1 1 L10 18"');
  });
});

describe('Setting nazar battu resolvers', () => {
  const setting = branding.Setting;

  it('shows the built-in charm when nothing is saved', () => {
    expect(setting.nazarBattuVisible([])).toBe(true);
    expect(setting.nazarBattuSvg([])).toBeNull();
  });

  it('hides the charm when the admin turns it off', () => {
    expect(
      setting.nazarBattuVisible([{ name: 'nazarBattuVisible', value: 'false' }])
    ).toBe(false);
    expect(
      setting.nazarBattuVisible([{ name: 'nazarBattuVisible', value: false }])
    ).toBe(false);
  });

  it('returns only a sanitized replacement', () => {
    expect(
      setting.nazarBattuSvg([{ name: 'nazarBattuSvg', value: face }])
    ).toContain('<circle');
    expect(
      setting.nazarBattuSvg([
        {
          name: 'nazarBattuSvg',
          value: '<svg viewBox="0 0 10 10"><foreignObject/></svg>'
        }
      ])
    ).toBeNull();
  });
});
