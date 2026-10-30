import { describe, expect, it } from '@jest/globals';
import {
  ensureCompanyFooter,
  ensureCompanyMenus
} from '../../services/companyPageLinks.js';
import { formatStoreContact } from '../../services/storeContact.js';

const IDS = {
  aboutId: '8f3c1a20-6d4e-4b11-9c77-1a2b3c4d5e60',
  contactId: '9a4d2b31-7e5f-4c22-8d88-2b3c4d5e6f71'
};

describe('formatStoreContact', () => {
  it('joins the city, province name, and postal code and skips blanks', () => {
    expect(
      formatStoreContact({
        phone: '  ',
        email: ' info@bharattextileindia.com ',
        address: 'House no. 904/1044, Gali no. 6, near Chacha Chowk',
        city: 'Faridabad',
        provinceName: 'Haryana',
        postalCode: '',
        countryName: 'India'
      })
    ).toEqual({
      phone: null,
      email: 'info@bharattextileindia.com',
      addressLines: [
        'House no. 904/1044, Gali no. 6, near Chacha Chowk',
        'Faridabad, Haryana',
        'India'
      ]
    });
  });

  it('returns no lines when every field is empty', () => {
    expect(formatStoreContact({})).toEqual({
      phone: null,
      email: null,
      addressLines: []
    });
  });
});

describe('ensureCompanyMenus', () => {
  it('adds About Us and Contact Us when the menu has neither', () => {
    const next = ensureCompanyMenus(
      [{ name: 'Fabrics', url: '/fabrics', children: [] }],
      IDS
    );
    expect(next?.map((item) => item.url)).toEqual([
      '/fabrics',
      '/about-us',
      '/contact-us'
    ]);
  });

  it('leaves a menu that already has both paths', () => {
    const menus = [
      { name: 'About Us', url: '/about-us' },
      { name: 'Contact Us', url: '/contact-us' }
    ];
    expect(ensureCompanyMenus(menus, IDS)).toBeNull();
  });
});

describe('ensureCompanyFooter', () => {
  it('places Contact us in the column that already links to About us', () => {
    const next = ensureCompanyFooter(
      [
        { id: 'shop', links: [{ label: 'Fabrics', url: '/fabrics' }] },
        { id: 'policies', links: [{ label: 'About us', url: '/about-us' }] }
      ],
      'lnk-contact'
    );
    expect(next?.[1].links?.map((link) => link.url)).toEqual([
      '/about-us',
      '/contact-us'
    ]);
    expect(next?.[0].links).toHaveLength(1);
  });

  it('leaves a footer that already links to contact', () => {
    const columns = [{ links: [{ url: '/contact-us', label: 'Contact us' }] }];
    expect(ensureCompanyFooter(columns, 'lnk-contact')).toBeNull();
  });
});
