import {
  checkDesignDetails,
  checkProfileInput,
  checkSlug,
  designerCan,
  designSku,
  maskAccount,
  reviewerCan,
  slugify
} from '../../services/designerRules.js';

describe('designer profile', () => {
  test('slug follows the display name', () => {
    expect(slugify('Sowmiya S')).toBe('sowmiya-s');
    expect(slugify('  Éva   Studio!! ')).toBe('eva-studio');
    expect(checkSlug('ab').ok).toBe(false);
    expect(checkSlug('admin').ok).toBe(false);
  });

  test('needs a display name', () => {
    expect(checkProfileInput({ displayName: ' ' }).ok).toBe(false);
    const result = checkProfileInput({ displayName: 'Sowmiya S', bio: '<b>Hi</b>' });
    expect(result.ok && result.value.slug).toBe('sowmiya-s');
    expect(result.ok && result.value.bio).toBe('bHi/b');
    expect(result.ok && result.value.payoutMethod).toBeNull();
  });

  test('checks payout details', () => {
    expect(
      checkProfileInput({ displayName: 'Asha', payoutMethod: 'paypal', payoutPaypalEmail: 'x' }).ok
    ).toBe(false);
    expect(
      checkProfileInput({
        displayName: 'Asha',
        payoutMethod: 'bank',
        payoutBank: { accountName: 'Asha R', accountNumber: '12345678', ifsc: 'hdfc0001234' }
      }).ok
    ).toBe(true);
    expect(
      checkProfileInput({
        displayName: 'Asha',
        payoutMethod: 'bank',
        payoutBank: { accountName: 'Asha R', accountNumber: '12a', ifsc: 'HDFC0001234' }
      }).ok
    ).toBe(false);
    expect(checkProfileInput({ displayName: 'Asha', payoutMethod: 'cash' }).ok).toBe(false);
  });

  test('checks tax ids only when given', () => {
    expect(checkProfileInput({ displayName: 'Asha', gstin: 'bad' }).ok).toBe(false);
    expect(checkProfileInput({ displayName: 'Asha', pan: 'ABCDE1234F' }).ok).toBe(true);
  });

  test('masks the account number', () => {
    expect(maskAccount('1234567890')).toBe('•••• 7890');
    expect(maskAccount(null)).toBe('');
  });
});

describe('design details', () => {
  const valid = { name: 'Rustic Floral', category: 'Floral', colors: ['Brown', 'Yellow'] };

  test('needs a name, a category and a colour', () => {
    expect(checkDesignDetails(valid).ok).toBe(true);
    expect(checkDesignDetails({ ...valid, name: '' }).ok).toBe(false);
    expect(checkDesignDetails({ ...valid, category: 'Cars' }).ok).toBe(false);
    expect(checkDesignDetails({ ...valid, colors: ['Gold'] }).ok).toBe(false);
  });

  test('reads lists sent by a multipart form', () => {
    const result = checkDesignDetails({
      ...valid,
      colors: '["Brown","Brown","Blue"]',
      tags: 'Leaves, autumn ,x,leaves'
    });
    expect(result.ok && result.value.colors).toEqual(['Brown', 'Blue']);
    expect(result.ok && result.value.tags).toEqual(['leaves', 'autumn']);
    expect(result.ok && result.value.repeatType).toBe('tile');
  });
});

describe('design lifecycle', () => {
  test('designer actions follow the state', () => {
    expect(designerCan('draft', 'submit')).toBe(true);
    expect(designerCan('approved', 'delete')).toBe(false);
    expect(designerCan('hidden', 'submit')).toBe(false);
    expect(designerCan('withdrawn', 'submit')).toBe(true);
  });

  test('admin actions follow the state', () => {
    expect(reviewerCan('pending', 'approve')).toBe(true);
    expect(reviewerCan('draft', 'approve')).toBe(false);
    expect(reviewerCan('approved', 'hide')).toBe(true);
    expect(reviewerCan('hidden', 'restore')).toBe(true);
  });

  test('sku is the design number', () => {
    expect(designSku(42)).toBe('D-00042');
  });
});
