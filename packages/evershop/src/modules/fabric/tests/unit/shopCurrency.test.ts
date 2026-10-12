import {
  exportMarginPercent,
  quotePrice,
  readDefaultMargin,
  readExchangeRate
} from '../../services/shopCurrency.js';

describe('shop currency', () => {
  test('keeps the India price and ignores the margin', () => {
    expect(quotePrice(490, 'INR', 1, 20)).toBe(490);
    expect(quotePrice(18, 'INR', 83, 50)).toBe(18);
  });

  test('adds the margin and divides by the rupee rate', () => {
    expect(quotePrice(490, 'USD', 83, 20)).toBe(7.08);
    expect(quotePrice(490, 'EUR', 90, 0)).toBe(5.44);
    expect(quotePrice(0, 'USD', 83, 20)).toBe(0);
  });

  test('does not round a tiny positive amount down to zero', () => {
    expect(quotePrice(0.1, 'USD', 83, 0)).toBe(0.01);
  });

  test('uses an explicit margin, including zero, and the store default only when blank', () => {
    expect(exportMarginPercent(0, true, 20)).toBe(0);
    expect(exportMarginPercent(null, true, 20)).toBe(20);
    expect(exportMarginPercent('', false, 20)).toBe(0);
    expect(exportMarginPercent(15, false, 20)).toBe(15);
    expect(readExchangeRate('', 83)).toBe(83);
    expect(readExchangeRate(0, 83)).toBe(83);
    expect(readExchangeRate('90.5', 83)).toBe(90.5);
    expect(readDefaultMargin('')).toBe(20);
    expect(readDefaultMargin(0)).toBe(0);
  });
});
