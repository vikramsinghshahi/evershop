import { describe, expect, it } from '@jest/globals';
import { ensureTermsFooter } from '../../services/termsFooter.js';

describe('ensureTermsFooter', () => {
  it('adds Terms & Conditions beside About us', () => {
    const next = ensureTermsFooter([
      { id: 'shop', links: [{ label: 'Fabrics', url: '/fabrics' }] },
      { id: 'policies', links: [{ label: 'About us', url: '/about-us' }] }
    ]);
    expect(next?.[1].links?.map((link) => link.url)).toEqual([
      '/about-us',
      '/terms-and-conditions'
    ]);
    expect(next?.[0].links).toHaveLength(1);
  });

  it('leaves a footer that already links to the page', () => {
    const columns = [
      { links: [{ label: 'Terms & Conditions', url: '/terms-and-conditions' }] }
    ];
    expect(ensureTermsFooter(columns)).toBeNull();
  });

  it('starts a Policies column when the footer has none', () => {
    const next = ensureTermsFooter([]);
    expect(next?.[0].title).toBe('Policies');
    expect(next?.[0].links?.[0].url).toBe('/terms-and-conditions');
  });
});
