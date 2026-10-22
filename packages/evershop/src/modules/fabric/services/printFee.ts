/** Starting printing fee per unit for a fabric. An admin can change it on the product. */
export const DEFAULT_PRINT_FEE = 5;

/**
 * A blank fee is none. A negative or unreadable value is none.
 * A zero is kept, so an admin can turn the charge off for one cloth.
 */
export function readPrintFee(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return Math.round(parsed * 100) / 100;
}

export function printFeeAmount(value: unknown): number {
  return readPrintFee(value) ?? 0;
}

/** Empty clears the fee. Absent from the payload leaves the stored fee alone. */
export function normalizePrintFee(data: Record<string, unknown> | null | undefined): void {
  if (!data || typeof data !== 'object' || !('print_fee' in data)) {
    return;
  }
  data.print_fee = readPrintFee(data.print_fee);
}

/** Fee snapshotted onto a printed line. Plain cloth and other lines contribute nothing. */
export function printFeeFromOptions(raw: string | null | undefined): number {
  if (!raw) {
    return 0;
  }
  try {
    const data = JSON.parse(raw) as { mode?: unknown; design?: unknown; printFee?: unknown };
    if (data.mode === 'plain' || !data.design) {
      return 0;
    }
    return printFeeAmount(data.printFee);
  } catch {
    return 0;
  }
}

/**
 * Rewrite the number inside a formatted price, keeping its currency symbol
 * and grouping. "$18.00" with 23 becomes "$23.00".
 */
export function formatLike(sample: string, amount: number): string {
  const match = sample.match(/-?\d[\d,]*(\.\d+)?/);
  if (!match || match.index === undefined) {
    return sample;
  }
  const fraction = match[1] ? match[1].slice(1).length : 0;
  const grouped = match[0].includes(',');
  const negative = amount < 0;
  const abs = Math.abs(amount);
  let digits = abs.toFixed(fraction);
  if (grouped) {
    const [whole, frac] = digits.split('.');
    const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    digits = frac !== undefined ? `${withCommas}.${frac}` : withCommas;
  }
  const next = `${negative ? '-' : ''}${digits}`;
  return sample.slice(0, match.index) + next + sample.slice(match.index + match[0].length);
}

/** Print-fee amount in the shopper's currency, with the matching symbol. */
export function formatPrintFee(
  amount: number,
  currency?: string | null,
  locale?: string | null
): string {
  if (!Number.isFinite(amount)) {
    return '';
  }
  if (currency && /^[A-Z]{3}$/.test(currency)) {
    try {
      return new Intl.NumberFormat(locale || undefined, {
        style: 'currency',
        currency
      }).format(amount);
    } catch {
      // Unknown currency code; keep the digits.
    }
  }
  return amount.toFixed(2);
}
