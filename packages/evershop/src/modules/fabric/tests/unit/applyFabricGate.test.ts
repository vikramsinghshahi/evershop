import {
  APPLY_FABRIC_STAY_URL,
  canShowApplyFabricResult,
  holdApplyFabricResult,
  readApplyFabricResult,
  readHeldApplyFabricResult,
  readStoredApplyFabricResult
} from '../../services/applyFabricGate.js';

const image = `data:image/png;base64,${'A'.repeat(40)}`;

describe('apply fabric sign-in gate', () => {
  test('keeps an empty redirect so login does not leave the page', () => {
    expect(APPLY_FABRIC_STAY_URL).toBe('');
  });

  test('accepts a data image and replaces an unsafe filename', () => {
    expect(readApplyFabricResult({ image, filename: 'applied-fabric.png' })).toEqual({
      image,
      filename: 'applied-fabric.png'
    });
    expect(readApplyFabricResult({ image, filename: '../secret.png' })?.filename).toBe(
      'applied-fabric.png'
    );
    expect(readApplyFabricResult({ image, filename: '' })?.filename).toBe('applied-fabric.png');
  });

  test('rejects anything that is not a generated image', () => {
    expect(readApplyFabricResult(null)).toBeNull();
    expect(readApplyFabricResult({ image: 'https://example.com/a.png', filename: 'a.png' })).toBeNull();
    expect(readApplyFabricResult({ image: 'data:text/html;base64,AAAA', filename: 'a.png' })).toBeNull();
    expect(readApplyFabricResult({ image: 'data:image/png;base64,short', filename: 'a.png' })).toBeNull();
  });

  test('hides the result until the customer is signed in', () => {
    const result = { image, filename: 'applied-fabric.png' };
    expect(canShowApplyFabricResult(false, result)).toBe(false);
    expect(canShowApplyFabricResult(true, result)).toBe(true);
    expect(canShowApplyFabricResult(true, null)).toBe(false);
    expect(
      canShowApplyFabricResult(true, { image: 'not-an-image', filename: 'a.png' })
    ).toBe(false);
  });

  test('does not keep a result outside the browser', () => {
    holdApplyFabricResult({ image, filename: 'applied-fabric.png' });
    expect(readHeldApplyFabricResult()).toBeNull();
    expect(readStoredApplyFabricResult()).toBeNull();
  });
});
