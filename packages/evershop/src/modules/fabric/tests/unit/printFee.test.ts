import { calculateTaxAmount } from '../../../tax/services/calculateTaxAmount.js';
import {
  formatLike,
  normalizePrintFee,
  printFeeFromOptions,
  readPrintFee
} from '../../services/printFee.js';
import { unitPriceWithPrintFee } from '../../services/printFeeCart.js';

const printed = JSON.stringify({
  printScale: 100,
  design: { name: 'Field Flower' },
  printFee: 5
});

describe('printing fee', () => {
  test('reads a fee and clears a blank one', () => {
    expect(readPrintFee('5')).toBe(5);
    expect(readPrintFee(' 4.5 ')).toBe(4.5);
    expect(readPrintFee(0)).toBe(0);
    expect(readPrintFee('')).toBeNull();
    expect(readPrintFee(-2)).toBeNull();
    expect(readPrintFee('nope')).toBeNull();

    const create: Record<string, unknown> = { print_fee: '' };
    normalizePrintFee(create);
    expect(create.print_fee).toBeNull();

    const untouched: Record<string, unknown> = { price: 18 };
    normalizePrintFee(untouched);
    expect(untouched).toEqual({ price: 18 });
  });

  test('adds the snapshotted fee only to a printed line', () => {
    expect(printFeeFromOptions(null)).toBe(0);
    expect(printFeeFromOptions('{"mode":"plain","printFee":5}')).toBe(0);
    expect(printFeeFromOptions('{"printScale":100}')).toBe(0);
    expect(printFeeFromOptions(printed)).toBe(5);

    expect(unitPriceWithPrintFee(18, printed, 'excl', false, 0)).toBe(23);
    expect(unitPriceWithPrintFee(18, '{"mode":"plain"}', 'excl', false, 10)).toBe(18);
    expect(unitPriceWithPrintFee(18, null, 'incl', false, 10)).toBe(18);

    const taxOnFee = calculateTaxAmount(10, 5, 1, false);
    expect(unitPriceWithPrintFee(19.8, printed, 'incl', false, 10)).toBe(19.8 + 5 + taxOnFee);

    const taxInsideFee = calculateTaxAmount(10, 5, 1, true);
    expect(unitPriceWithPrintFee(18, printed, 'incl', true, 10)).toBe(23);
    expect(unitPriceWithPrintFee(16.36, printed, 'excl', true, 10)).toBeCloseTo(
      16.36 + 5 - taxInsideFee,
      2
    );
  });

  test('keeps the currency symbol when the unit price grows', () => {
    expect(formatLike('$18.00', 23)).toBe('$23.00');
    expect(formatLike('$18.00', 5)).toBe('$5.00');
    expect(formatLike('$1,234.50', 1239.5)).toBe('$1,239.50');
  });
});
