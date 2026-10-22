import {
  exportMarginPercent,
  quotePrice,
  readDefaultMargin,
  readExchangeRate
} from '../../services/shopCurrency.js';
import { quotePrintFeeInOptions } from '../../services/shopCurrencyRates.js';
import { formatPrintFee } from '../../services/printFee.js';

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

  test('quotes a snapshotted printing fee in the shopper currency and leaves other lines alone', () => {
    const printed = JSON.stringify({
      printScale: 100,
      design: { name: 'Field Flower' },
      printFee: 5
    });
    expect(
      JSON.parse(
        quotePrintFeeInOptions(printed, {
          sku: 'FABRIC-COTTON-POPLIN',
          exportMargin: 20,
          currency: 'USD',
          rate: 83
        }) as string
      )
    ).toMatchObject({ printFee: 0.07, printFeeCurrency: 'USD' });
    expect(
      JSON.parse(
        quotePrintFeeInOptions(printed, {
          sku: 'FABRIC-COTTON-POPLIN',
          exportMargin: 0,
          currency: 'USD',
          rate: 83
        }) as string
      )
    ).toMatchObject({ printFee: 0.06, printFeeCurrency: 'USD' });
    expect(
      JSON.parse(
        quotePrintFeeInOptions(printed, {
          sku: 'FABRIC-COTTON-POPLIN',
          exportMargin: 20,
          currency: 'INR',
          rate: 1
        }) as string
      )
    ).toMatchObject({ printFee: 5, printFeeCurrency: 'INR' });
    expect(
      quotePrintFeeInOptions('{"mode":"plain","printFee":5}', {
        sku: 'FABRIC-COTTON-POPLIN',
        currency: 'USD',
        rate: 83,
        exportMargin: 20
      })
    ).toBe('{"mode":"plain","printFee":5}');
    expect(quotePrintFeeInOptions(null, { currency: 'USD', rate: 83 })).toBeNull();
    expect(quotePrintFeeInOptions('not-json', { currency: 'USD', rate: 83 })).toBe(
      'not-json'
    );
    expect(formatPrintFee(0.07, 'USD', 'en')).toBe('$0.07');
    expect(formatPrintFee(5, 'INR', 'en')).toBe('₹5.00');
  });
});
