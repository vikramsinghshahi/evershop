/**
 * Commission arithmetic. Every amount the wallet stores is in rupees,
 * rounded to paise. No database access, so the rules are unit-tested.
 */

export const DEFAULT_COMMISSION_RATE = 10;
export const DEFAULT_HOLD_DAYS = 14;
export const DEFAULT_MIN_PAYOUT = 500;

export interface BonusTier {
  /** Commission earned in the month, in rupees, needed to reach this tier. */
  threshold: number;
  /** Extra percent of that month's sales value. */
  percent: number;
}

export const DEFAULT_BONUS_TIERS: BonusTier[] = [
  { threshold: 25000, percent: 3 },
  { threshold: 100000, percent: 5 }
];

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
}

/** A blank, negative or absurd rate falls back to the default. */
export function readRate(value: unknown, fallback = DEFAULT_COMMISSION_RATE): number {
  const parsed = toNumber(value);
  if (parsed === null || parsed < 0 || parsed > 50) {
    return fallback;
  }
  return round2(parsed);
}

export function readHoldDays(value: unknown): number {
  const parsed = toNumber(value);
  if (parsed === null || parsed < 0 || parsed > 365 || !Number.isInteger(parsed)) {
    return DEFAULT_HOLD_DAYS;
  }
  return parsed;
}

export function readMinPayout(value: unknown): number {
  const parsed = toNumber(value);
  if (parsed === null || parsed < 0) {
    return DEFAULT_MIN_PAYOUT;
  }
  return round2(parsed);
}

export function readBonusTiers(value: unknown): BonusTier[] {
  let raw = value;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      return DEFAULT_BONUS_TIERS;
    }
  }
  if (!Array.isArray(raw)) {
    return DEFAULT_BONUS_TIERS;
  }
  const tiers = raw
    .map((tier) => ({
      threshold: toNumber((tier as BonusTier)?.threshold),
      percent: toNumber((tier as BonusTier)?.percent)
    }))
    .filter(
      (tier): tier is BonusTier =>
        tier.threshold !== null &&
        tier.percent !== null &&
        tier.threshold > 0 &&
        tier.percent > 0 &&
        tier.percent <= 50
    )
    .sort((a, b) => a.threshold - b.threshold);
  return tiers;
}

/**
 * The designer's rate wins over the store rate. Zero is a real rate: the
 * admin can switch commission off for one designer.
 */
export function effectiveRate(designerRate: unknown, storeRate: unknown): number {
  const store = readRate(storeRate);
  const own = toNumber(designerRate);
  if (own === null || own < 0 || own > 50) {
    return store;
  }
  return round2(own);
}

export interface LineCommission {
  /** Line value in rupees: after discount, before tax and shipping. */
  baseInr: number;
  amount: number;
}

/**
 * `lineTotal` is the order line after discount and before tax, in the order
 * currency. `exchangeRate` is rupees for one unit of that currency, frozen
 * when the order was placed.
 */
export function lineCommission(
  lineTotal: unknown,
  exchangeRate: unknown,
  ratePercent: number
): LineCommission | null {
  const total = toNumber(lineTotal);
  const rate = toNumber(exchangeRate) ?? 1;
  if (total === null || total <= 0 || rate <= 0 || ratePercent <= 0) {
    return null;
  }
  const baseInr = round2(total * rate);
  const amount = round2((baseInr * ratePercent) / 100);
  if (amount <= 0) {
    return null;
  }
  return { baseInr, amount };
}

export interface MonthlyBonus {
  percent: number;
  amount: number;
}

/**
 * Highest tier whose threshold the month's net commission reaches. The
 * bonus is that percent of the month's net sales value.
 */
export function monthlyBonus(
  netCommission: number,
  netSales: number,
  tiers: BonusTier[]
): MonthlyBonus | null {
  if (!(netCommission > 0) || !(netSales > 0)) {
    return null;
  }
  let reached: BonusTier | null = null;
  for (const tier of tiers) {
    if (netCommission >= tier.threshold) {
      reached = tier;
    }
  }
  if (!reached) {
    return null;
  }
  const amount = round2((netSales * reached.percent) / 100);
  return amount > 0 ? { percent: reached.percent, amount } : null;
}

/** Share of the order a refund covers, between 0 and 1. */
export function refundShare(refundAmount: unknown, orderTotal: unknown): number {
  const refund = toNumber(refundAmount);
  const total = toNumber(orderTotal);
  if (refund === null || total === null || refund <= 0 || total <= 0) {
    return 0;
  }
  return Math.min(1, refund / total);
}

export interface ReversibleCommission {
  id: number;
  amount: number;
  /** Positive sum already taken back from this commission. */
  reversed: number;
}

/**
 * How much to take back from each commission for one refund. Never takes
 * back more than is left on a line, so repeated partial refunds add up to
 * at most the original commission.
 */
export function reversalsForRefund(
  commissions: ReversibleCommission[],
  share: number,
  isFullRefund: boolean
): { id: number; amount: number }[] {
  return commissions
    .map((commission) => {
      const left = round2(commission.amount - commission.reversed);
      if (left <= 0) {
        return { id: commission.id, amount: 0 };
      }
      const wanted = isFullRefund ? left : round2(commission.amount * share);
      return { id: commission.id, amount: Math.min(left, wanted) };
    })
    .filter((reversal) => reversal.amount > 0);
}

/** Calendar month as `YYYY-MM`, in UTC. */
export function periodOf(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function previousPeriod(now: Date): string {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return periodOf(date);
}

export function periodRange(period: string): { start: Date; end: Date } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(period);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  if (month < 0 || month > 11) {
    return null;
  }
  return {
    start: new Date(Date.UTC(year, month, 1)),
    end: new Date(Date.UTC(year, month + 1, 1))
  };
}

/** A commission is payable once the order is done and the return window has passed. */
export function isReleasable(
  orderStatus: string | null | undefined,
  finishedAt: Date | null,
  holdDays: number,
  now: Date
): boolean {
  if (orderStatus !== 'completed' && orderStatus !== 'closed') {
    return false;
  }
  if (!finishedAt) {
    return false;
  }
  return now.getTime() - finishedAt.getTime() >= holdDays * 24 * 60 * 60 * 1000;
}
