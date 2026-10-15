import type { PoolClient } from 'pg';
import { info } from '../../../lib/log/logger.js';
import { isShopCurrency } from '../../fabric/services/shopCurrency.js';
import { exchangeRateFor } from '../../fabric/services/shopCurrencyRates.js';
import { getSetting } from '../../setting/services/setting.js';
import {
  effectiveRate,
  isReleasable,
  lineCommission,
  monthlyBonus,
  periodRange,
  previousPeriod,
  readBonusTiers,
  readHoldDays,
  readMinPayout,
  refundShare,
  reversalsForRefund,
  round2
} from './commission.js';
import { DesignerError, inTransaction, money, one, rows } from './db.js';
import { notifyDesigner } from './notify.js';
import type { ProfileRow } from './profiles.js';

interface OrderRow {
  order_id: number;
  order_number: string;
  status: string | null;
  customer_id: number | null;
  customer_email: string | null;
  currency: string;
  exchange_rate: string | null;
  grand_total: string;
  updated_at: Date;
}

interface OrderItemRow {
  order_item_id: number;
  qty: number;
  final_price: string;
  discount_amount: string | null;
  line_total_with_discount: string | null;
  product_custom_options: string | null;
}

interface DesignLine {
  designUuid: string;
}

/** Designer artwork on a stored line, or null for plain cloth and other designs. */
export function designerLine(raw: string | null): DesignLine | null {
  if (!raw) {
    return null;
  }
  try {
    const data = JSON.parse(raw) as { mode?: string; design?: { source?: string; designId?: unknown } };
    if (data.mode === 'plain' || data.design?.source !== 'designer') {
      return null;
    }
    const id = data.design.designId;
    return typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id) ? { designUuid: id } : null;
  } catch {
    return null;
  }
}

/** Rupees for one unit of the order currency. Old orders saved no rate. */
function orderRate(order: OrderRow): number {
  const saved = Number(order.exchange_rate);
  if (Number.isFinite(saved) && saved > 0) {
    return saved;
  }
  if (order.currency === 'INR') {
    return 1;
  }
  return isShopCurrency(order.currency) ? exchangeRateFor(order.currency) : 1;
}

function lineValue(item: OrderItemRow): number {
  if (item.line_total_with_discount !== null && item.line_total_with_discount !== undefined) {
    return money(item.line_total_with_discount);
  }
  return money(Number(item.final_price) * item.qty - Number(item.discount_amount || 0));
}

/**
 * One pending commission per designer line. Safe to run twice for the same
 * order: the unique index on the line keeps the first entry.
 */
export async function recordOrderCommissions(orderId: number): Promise<number> {
  const order = await one<OrderRow>(`SELECT * FROM "order" WHERE "order_id" = $1`, [orderId]);
  if (!order || order.status === 'canceled') {
    return 0;
  }
  const items = await rows<OrderItemRow>(
    `SELECT "order_item_id", "qty", "final_price", "discount_amount", "line_total_with_discount", "product_custom_options"
       FROM "order_item" WHERE "order_item_order_id" = $1`,
    [orderId]
  );
  const lines = items
    .map((item) => ({ item, line: designerLine(item.product_custom_options) }))
    .filter((entry): entry is { item: OrderItemRow; line: DesignLine } => entry.line !== null);
  if (lines.length === 0) {
    return 0;
  }
  const storeRate = await getSetting('designerCommissionRate', '10');
  const rate = orderRate(order);
  const buyerEmail = (order.customer_email || '').trim().toLowerCase();
  let recorded = 0;
  for (const { item, line } of lines) {
    const owner = await one<{
      designer_design_id: number;
      designer_profile_id: number;
      name: string;
      commission_rate: string | null;
      customer_id: number | null;
      email: string | null;
    }>(
      `SELECT d."designer_design_id", d."designer_profile_id", d."name",
              p."commission_rate", p."customer_id", c."email"
         FROM "designer_design" d
         JOIN "designer_profile" p ON p."designer_profile_id" = d."designer_profile_id"
         LEFT JOIN "customer" c ON c."customer_id" = p."customer_id"
        WHERE d."uuid" = $1`,
      [line.designUuid]
    );
    if (!owner) {
      continue;
    }
    // A designer buying their own design earns nothing, logged in or as a guest.
    const ownPurchase =
      (order.customer_id !== null && order.customer_id === owner.customer_id) ||
      (buyerEmail !== '' && buyerEmail === (owner.email || '').trim().toLowerCase());
    if (ownPurchase) {
      continue;
    }
    const percent = effectiveRate(owner.commission_rate, storeRate);
    const commission = lineCommission(lineValue(item), rate, percent);
    if (!commission) {
      continue;
    }
    const inserted = await inTransaction(async (client) => {
      const entry = await one(
        `INSERT INTO "designer_wallet_entry"
           ("designer_profile_id", "type", "status", "amount", "base_amount", "rate",
            "order_id", "order_item_id", "designer_design_id", "description", "currency", "exchange_rate")
         VALUES ($1, 'commission', 'pending', $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT ("order_item_id") WHERE "type" = 'commission' DO NOTHING
         RETURNING "designer_wallet_entry_id"`,
        [
          owner.designer_profile_id,
          commission.amount,
          commission.baseInr,
          percent,
          order.order_id,
          item.order_item_id,
          owner.designer_design_id,
          `${percent}% of order #${order.order_number} · ${owner.name}`,
          order.currency,
          rate
        ],
        client
      );
      if (entry) {
        await client.query(
          `UPDATE "designer_design" SET "sales_count" = "sales_count" + 1 WHERE "designer_design_id" = $1`,
          [owner.designer_design_id]
        );
      }
      return entry !== null;
    });
    if (inserted) {
      recorded += 1;
    }
  }
  return recorded;
}

interface CommissionEntry {
  designer_wallet_entry_id: number;
  designer_profile_id: number;
  designer_design_id: number | null;
  order_item_id: number;
  status: string;
  amount: string;
  reversed: string;
}

async function orderCommissions(orderId: number, client: PoolClient): Promise<CommissionEntry[]> {
  return rows<CommissionEntry>(
    `SELECT c."designer_wallet_entry_id", c."designer_profile_id", c."designer_design_id",
            c."order_item_id", c."status", c."amount",
            COALESCE((
              SELECT -SUM(r."amount") FROM "designer_wallet_entry" r
               WHERE r."type" = 'reversal' AND r."order_item_id" = c."order_item_id" AND r."status" <> 'void'
            ), 0) AS reversed
       FROM "designer_wallet_entry" c
      WHERE c."type" = 'commission' AND c."order_id" = $1 AND c."status" <> 'void'
      FOR UPDATE`,
    [orderId],
    client
  );
}

/**
 * Unpaid commission is voided outright. Commission already paid out comes
 * back as a debit that the next payout absorbs.
 */
export async function cancelOrderCommissions(orderId: number): Promise<void> {
  await inTransaction(async (client) => {
    const commissions = await orderCommissions(orderId, client);
    for (const commission of commissions) {
      if (commission.status === 'paid') {
        const left = round2(money(commission.amount) - money(commission.reversed));
        if (left > 0) {
          await client.query(
            `INSERT INTO "designer_wallet_entry"
               ("designer_profile_id", "type", "status", "amount", "order_id", "order_item_id",
                "designer_design_id", "reference", "description")
             VALUES ($1, 'reversal', 'available', $2, $3, $4, $5, 'cancel', 'Order canceled after payout')
             ON CONFLICT ("order_item_id", "reference") WHERE "type" = 'reversal' DO NOTHING`,
            [
              commission.designer_profile_id,
              -left,
              orderId,
              commission.order_item_id,
              commission.designer_design_id
            ]
          );
        }
      } else {
        await client.query(
          `UPDATE "designer_wallet_entry" SET "status" = 'void', "updated_at" = NOW()
            WHERE "order_item_id" = $1 AND "type" IN ('commission', 'reversal') AND "status" IN ('pending', 'available')`,
          [commission.order_item_id]
        );
      }
      if (commission.designer_design_id) {
        await client.query(
          `UPDATE "designer_design" SET "sales_count" = GREATEST("sales_count" - 1, 0) WHERE "designer_design_id" = $1`,
          [commission.designer_design_id]
        );
      }
    }
  });
}

/**
 * Takes back the refunded share of each line's commission. Refunds are per
 * order, so the share is the refund over the order total.
 */
export async function reverseRefundedCommissions(event: {
  orderId: number;
  amount: number;
  isFullRefund: boolean;
  transactionId: string;
}): Promise<void> {
  const order = await one<OrderRow>(`SELECT * FROM "order" WHERE "order_id" = $1`, [event.orderId]);
  if (!order) {
    return;
  }
  const share = refundShare(event.amount, order.grand_total);
  const reference = String(event.transactionId || '').slice(0, 120) || `refund-${Date.now()}`;
  await inTransaction(async (client) => {
    const commissions = await orderCommissions(event.orderId, client);
    const reversals = reversalsForRefund(
      commissions.map((commission) => ({
        id: commission.designer_wallet_entry_id,
        amount: money(commission.amount),
        reversed: money(commission.reversed)
      })),
      share,
      event.isFullRefund
    );
    for (const reversal of reversals) {
      const commission = commissions.find(
        (entry) => entry.designer_wallet_entry_id === reversal.id
      ) as CommissionEntry;
      // Unpaid: the debit waits with the commission. Paid: it comes off the next payout.
      const status = commission.status === 'paid' ? 'available' : commission.status;
      await client.query(
        `INSERT INTO "designer_wallet_entry"
           ("designer_profile_id", "type", "status", "amount", "order_id", "order_item_id",
            "designer_design_id", "reference", "description")
         VALUES ($1, 'reversal', $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT ("order_item_id", "reference") WHERE "type" = 'reversal' DO NOTHING`,
        [
          commission.designer_profile_id,
          status,
          -reversal.amount,
          event.orderId,
          commission.order_item_id,
          commission.designer_design_id,
          reference,
          `${event.isFullRefund ? 'Full' : 'Partial'} refund on order #${order.order_number}`
        ]
      );
    }
  });
}

/**
 * Daily. Pending entries become payable once the order is completed and
 * the return window has passed. Pending entries on a canceled order (a
 * missed event) are voided.
 */
export async function releaseDueCommissions(now = new Date()): Promise<number> {
  const holdDays = readHoldDays(await getSetting('designerHoldDays', '14'));
  const orders = await rows<{
    order_id: number;
    status: string | null;
    finished_at: Date | null;
  }>(
    `SELECT o."order_id", o."status",
            COALESCE(
              (SELECT MAX(s."delivered_at") FROM "shipment" s WHERE s."shipment_order_id" = o."order_id"),
              o."updated_at"
            ) AS finished_at
       FROM "order" o
      WHERE o."order_id" IN (
        SELECT DISTINCT "order_id" FROM "designer_wallet_entry"
         WHERE "status" = 'pending' AND "order_id" IS NOT NULL
      )`
  );
  let released = 0;
  for (const order of orders) {
    if (order.status === 'canceled') {
      await cancelOrderCommissions(order.order_id);
      continue;
    }
    if (!isReleasable(order.status, order.finished_at ? new Date(order.finished_at) : null, holdDays, now)) {
      continue;
    }
    const result = await one<{ count: number }>(
      `WITH moved AS (
         UPDATE "designer_wallet_entry" SET "status" = 'available', "updated_at" = NOW()
          WHERE "order_id" = $1 AND "status" = 'pending'
          RETURNING 1
       ) SELECT COUNT(*)::int AS count FROM moved`,
      [order.order_id]
    );
    released += result?.count ?? 0;
  }
  if (released > 0) {
    info(`Designer commission: ${released} entries are now payable`);
  }
  return released;
}

/**
 * Monthly. Bonus on last month's net commission, paid as a share of last
 * month's net sales. One bonus per designer per month.
 */
export async function grantMonthlyBonuses(now = new Date()): Promise<number> {
  const period = previousPeriod(now);
  const range = periodRange(period);
  if (!range) {
    return 0;
  }
  const tiers = readBonusTiers(await getSetting('designerBonusTiers', ''));
  if (tiers.length === 0) {
    return 0;
  }
  const totals = await rows<{
    designer_profile_id: number;
    net_commission: string;
    net_sales: string;
  }>(
    `SELECT c."designer_profile_id",
            SUM(c."amount" + COALESCE(r.reversed, 0)) AS net_commission,
            SUM(CASE WHEN c."amount" > 0
                     THEN c."base_amount" * (c."amount" + COALESCE(r.reversed, 0)) / c."amount"
                     ELSE 0 END) AS net_sales
       FROM "designer_wallet_entry" c
       LEFT JOIN (
         SELECT "order_item_id", SUM("amount") AS reversed
           FROM "designer_wallet_entry"
          WHERE "type" = 'reversal' AND "status" <> 'void'
          GROUP BY "order_item_id"
       ) r ON r."order_item_id" = c."order_item_id"
      WHERE c."type" = 'commission' AND c."status" <> 'void'
        AND c."created_at" >= $1 AND c."created_at" < $2
      GROUP BY c."designer_profile_id"`,
    [range.start, range.end]
  );
  let granted = 0;
  for (const total of totals) {
    const bonus = monthlyBonus(money(total.net_commission), money(total.net_sales), tiers);
    if (!bonus) {
      continue;
    }
    const entry = await one(
      `INSERT INTO "designer_wallet_entry"
         ("designer_profile_id", "type", "status", "amount", "base_amount", "rate", "period", "description")
       VALUES ($1, 'bonus', 'available', $2, $3, $4, $5, $6)
       ON CONFLICT ("designer_profile_id", "period") WHERE "type" = 'bonus' DO NOTHING
       RETURNING "designer_wallet_entry_id"`,
      [
        total.designer_profile_id,
        bonus.amount,
        money(total.net_sales),
        bonus.percent,
        period,
        `${bonus.percent}% monthly bonus for ${period}`
      ]
    );
    if (entry) {
      granted += 1;
      const profile = await one<ProfileRow>(
        `SELECT * FROM "designer_profile" WHERE "designer_profile_id" = $1`,
        [total.designer_profile_id]
      );
      if (profile) {
        await notifyDesigner(
          profile,
          'You earned a monthly bonus',
          `Your sales in ${period} earned a ${bonus.percent}% bonus of ₹${bonus.amount.toFixed(2)}. It is in your wallet and will be paid with your next payout.`
        );
      }
    }
  }
  return granted;
}

export interface WalletSummary {
  pending: number;
  available: number;
  paidOut: number;
  lifetime: number;
  minPayout: number;
}

export async function walletSummary(profileId: number): Promise<WalletSummary> {
  const row = await one<{
    pending: string;
    available: string;
    paid_out: string;
    lifetime: string;
  }>(
    `SELECT
       COALESCE(SUM("amount") FILTER (WHERE "status" = 'pending'), 0) AS pending,
       COALESCE(SUM("amount") FILTER (WHERE "status" = 'available'), 0) AS available,
       COALESCE(-SUM("amount") FILTER (WHERE "type" = 'payout'), 0) AS paid_out,
       COALESCE(SUM("amount") FILTER (WHERE "type" <> 'payout' AND "status" <> 'void'), 0) AS lifetime
     FROM "designer_wallet_entry" WHERE "designer_profile_id" = $1`,
    [profileId]
  );
  return {
    pending: money(row?.pending),
    available: money(row?.available),
    paidOut: money(row?.paid_out),
    lifetime: money(row?.lifetime),
    minPayout: readMinPayout(await getSetting('designerMinPayout', '500'))
  };
}

export interface WalletEntryRow {
  uuid: string;
  type: string;
  status: string;
  amount: string;
  base_amount: string | null;
  rate: string | null;
  description: string | null;
  reference: string | null;
  order_number: string | null;
  design_name: string | null;
  design_sku: string | null;
  created_at: Date;
}

export async function walletEntries(profileId: number, limit = 100): Promise<WalletEntryRow[]> {
  return rows<WalletEntryRow>(
    `SELECT e."uuid", e."type", e."status", e."amount", e."base_amount", e."rate",
            e."description", e."reference", o."order_number", d."name" AS design_name,
            d."sku" AS design_sku, e."created_at"
       FROM "designer_wallet_entry" e
       LEFT JOIN "order" o ON o."order_id" = e."order_id"
       LEFT JOIN "designer_design" d ON d."designer_design_id" = e."designer_design_id"
      WHERE e."designer_profile_id" = $1
      ORDER BY e."created_at" DESC, e."designer_wallet_entry_id" DESC
      LIMIT $2`,
    [profileId, Math.min(500, Math.max(1, limit))]
  );
}

export interface PayoutBalanceRow {
  uuid: string;
  display_name: string;
  status: string;
  email: string | null;
  payout_method: string | null;
  payout_paypal_email: string | null;
  payout_bank: ProfileRow['payout_bank'];
  pending: string;
  available: string;
  paid_out: string;
  last_payout_at: Date | null;
}

export async function payoutBalances(): Promise<PayoutBalanceRow[]> {
  return rows<PayoutBalanceRow>(
    `SELECT p."uuid", p."display_name", p."status", c."email", p."payout_method",
            p."payout_paypal_email", p."payout_bank",
            COALESCE(SUM(e."amount") FILTER (WHERE e."status" = 'pending'), 0) AS pending,
            COALESCE(SUM(e."amount") FILTER (WHERE e."status" = 'available'), 0) AS available,
            COALESCE(-SUM(e."amount") FILTER (WHERE e."type" = 'payout'), 0) AS paid_out,
            MAX(e."created_at") FILTER (WHERE e."type" = 'payout') AS last_payout_at
       FROM "designer_profile" p
       LEFT JOIN "customer" c ON c."customer_id" = p."customer_id"
       JOIN "designer_wallet_entry" e ON e."designer_profile_id" = p."designer_profile_id"
      GROUP BY p."designer_profile_id", c."email"
      ORDER BY available DESC, p."display_name"`
  );
}

export async function recentPayouts(limit = 50): Promise<
  {
    uuid: string;
    amount: string;
    method: string;
    reference: string;
    note: string | null;
    paid_by: string | null;
    created_at: Date;
    display_name: string;
  }[]
> {
  return rows(
    `SELECT y."uuid", y."amount", y."method", y."reference", y."note", y."paid_by", y."created_at",
            p."display_name"
       FROM "designer_payout" y
       JOIN "designer_profile" p ON p."designer_profile_id" = y."designer_profile_id"
      ORDER BY y."created_at" DESC LIMIT $1`,
    [limit]
  );
}

/**
 * Records money the admin already sent. Settles everything payable at this
 * moment; the designer row is locked so two clicks cannot pay twice.
 */
export async function recordPayout(
  profileUuid: string,
  reference: string,
  note: string | null,
  paidBy: string | null
): Promise<{ amount: number }> {
  const ref = reference.replace(/\s+/g, ' ').trim().slice(0, 120);
  if (ref.length < 3) {
    throw new DesignerError('Enter the PayPal or bank transfer reference for this payment.');
  }
  const minPayout = readMinPayout(await getSetting('designerMinPayout', '500'));
  const result = await inTransaction(async (client) => {
    const profile = await one<ProfileRow>(
      `SELECT * FROM "designer_profile" WHERE "uuid" = $1 FOR UPDATE`,
      [profileUuid],
      client
    );
    if (!profile) {
      throw new DesignerError('That designer no longer exists.', 404);
    }
    if (!profile.payout_method) {
      throw new DesignerError('The designer has not added PayPal or bank details yet.');
    }
    const balance = await one<{ available: string }>(
      `SELECT COALESCE(SUM("amount"), 0) AS available FROM "designer_wallet_entry"
        WHERE "designer_profile_id" = $1 AND "status" = 'available'`,
      [profile.designer_profile_id],
      client
    );
    const amount = money(balance?.available);
    if (amount <= 0) {
      throw new DesignerError('Nothing is payable for this designer right now.');
    }
    if (amount < minPayout) {
      throw new DesignerError(`The payable balance ₹${amount.toFixed(2)} is below the ₹${minPayout.toFixed(2)} minimum payout.`);
    }
    const payout = await one<{ designer_payout_id: number }>(
      `INSERT INTO "designer_payout" ("designer_profile_id", "amount", "method", "reference", "note", "paid_by")
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING "designer_payout_id"`,
      [profile.designer_profile_id, amount, profile.payout_method, ref, note, paidBy],
      client
    );
    const payoutId = (payout as { designer_payout_id: number }).designer_payout_id;
    await client.query(
      `UPDATE "designer_wallet_entry" SET "status" = 'paid', "paid_payout_id" = $2, "updated_at" = NOW()
        WHERE "designer_profile_id" = $1 AND "status" = 'available'`,
      [profile.designer_profile_id, payoutId]
    );
    await client.query(
      `INSERT INTO "designer_wallet_entry"
         ("designer_profile_id", "type", "status", "amount", "designer_payout_id", "reference", "description")
       VALUES ($1, 'payout', 'paid', $2, $3, $4, $5)`,
      [
        profile.designer_profile_id,
        -amount,
        payoutId,
        ref,
        `Paid by ${profile.payout_method === 'paypal' ? 'PayPal' : 'bank transfer'}`
      ]
    );
    return { amount, profile };
  });
  await notifyDesigner(
    result.profile,
    'Your commission was paid',
    `We sent ₹${result.amount.toFixed(2)} by ${
      result.profile.payout_method === 'paypal' ? 'PayPal' : 'bank transfer'
    }. Reference: ${ref}.`
  );
  return { amount: result.amount };
}
