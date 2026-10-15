import {
  DEFAULT_BONUS_TIERS,
  effectiveRate,
  isReleasable,
  lineCommission,
  monthlyBonus,
  periodRange,
  previousPeriod,
  readBonusTiers,
  readRate,
  refundShare,
  reversalsForRefund
} from '../../services/commission.js';

describe('designer commission', () => {
  test('ten percent of the line value in rupees', () => {
    expect(lineCommission(1000, 1, 10)).toEqual({ baseInr: 1000, amount: 100 });
    expect(lineCommission('12.50', 83, 10)).toEqual({ baseInr: 1037.5, amount: 103.75 });
  });

  test('no commission for an empty, negative or free line', () => {
    expect(lineCommission(0, 1, 10)).toBeNull();
    expect(lineCommission(-5, 1, 10)).toBeNull();
    expect(lineCommission(null, 1, 10)).toBeNull();
    expect(lineCommission(100, 1, 0)).toBeNull();
  });

  test('a missing exchange rate is treated as rupees', () => {
    expect(lineCommission(200, null, 10)).toEqual({ baseInr: 200, amount: 20 });
  });

  test('the designer rate wins, including zero', () => {
    expect(effectiveRate(null, '10')).toBe(10);
    expect(effectiveRate('12.5', 10)).toBe(12.5);
    expect(effectiveRate(0, 10)).toBe(0);
    expect(effectiveRate(80, 10)).toBe(10);
    expect(readRate('abc')).toBe(10);
  });
});

describe('monthly bonus', () => {
  test('reaches the highest tier passed', () => {
    expect(monthlyBonus(24999, 249990, DEFAULT_BONUS_TIERS)).toBeNull();
    expect(monthlyBonus(25000, 250000, DEFAULT_BONUS_TIERS)).toEqual({ percent: 3, amount: 7500 });
    expect(monthlyBonus(120000, 1200000, DEFAULT_BONUS_TIERS)).toEqual({
      percent: 5,
      amount: 60000
    });
  });

  test('reads tiers from settings and drops bad rows', () => {
    expect(readBonusTiers('[{"threshold":100,"percent":2},{"threshold":"x","percent":3}]')).toEqual([
      { threshold: 100, percent: 2 }
    ]);
    expect(readBonusTiers('not json')).toEqual(DEFAULT_BONUS_TIERS);
    expect(readBonusTiers([])).toEqual([]);
  });

  test('previous month and its range', () => {
    expect(previousPeriod(new Date(Date.UTC(2026, 0, 1)))).toBe('2025-12');
    const range = periodRange('2026-02');
    expect(range?.start.toISOString()).toBe('2026-02-01T00:00:00.000Z');
    expect(range?.end.toISOString()).toBe('2026-03-01T00:00:00.000Z');
    expect(periodRange('2026-13')).toBeNull();
  });
});

describe('refund reversal', () => {
  test('a partial refund takes back the same share of each line', () => {
    const share = refundShare(250, 1000);
    expect(share).toBe(0.25);
    expect(
      reversalsForRefund(
        [
          { id: 1, amount: 60, reversed: 0 },
          { id: 2, amount: 40, reversed: 0 }
        ],
        share,
        false
      )
    ).toEqual([
      { id: 1, amount: 15 },
      { id: 2, amount: 10 }
    ]);
  });

  test('never takes back more than is left', () => {
    expect(
      reversalsForRefund([{ id: 1, amount: 60, reversed: 50 }], 0.5, false)
    ).toEqual([{ id: 1, amount: 10 }]);
    expect(reversalsForRefund([{ id: 1, amount: 60, reversed: 60 }], 1, true)).toEqual([]);
  });

  test('a full refund takes back whatever is left', () => {
    expect(reversalsForRefund([{ id: 1, amount: 60, reversed: 15 }], 0.1, true)).toEqual([
      { id: 1, amount: 45 }
    ]);
  });

  test('a refund larger than the order is capped', () => {
    expect(refundShare(2000, 1000)).toBe(1);
    expect(refundShare(0, 1000)).toBe(0);
  });
});

describe('release', () => {
  const delivered = new Date('2026-01-01T00:00:00Z');
  test('waits for a finished order and the return window', () => {
    expect(isReleasable('processing', delivered, 14, new Date('2026-03-01'))).toBe(false);
    expect(isReleasable('completed', delivered, 14, new Date('2026-01-10'))).toBe(false);
    expect(isReleasable('completed', delivered, 14, new Date('2026-01-15T00:00:00Z'))).toBe(true);
    expect(isReleasable('completed', null, 14, new Date('2026-03-01'))).toBe(false);
  });
});
