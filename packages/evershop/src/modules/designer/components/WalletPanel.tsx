import React from 'react';
import { inr } from './SellerAgreement.js';

export interface WalletSummary {
  pending: number;
  available: number;
  paidOut: number;
  lifetime: number;
  minPayout: number;
}

export interface WalletEntry {
  uuid: string;
  type: string;
  status: string;
  amount: number;
  baseAmount: number | null;
  rate: number | null;
  description: string | null;
  reference: string | null;
  orderNumber: string | null;
  designName: string | null;
  designSku: string | null;
  createdAt: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  commission: 'Commission',
  bonus: 'Monthly bonus',
  reversal: 'Refund or cancellation',
  payout: 'Payout',
  adjustment: 'Adjustment'
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'On hold',
  available: 'Payable',
  paid: 'Paid',
  void: 'Canceled'
};

function day(iso: string | null): string {
  return iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
}

function detail(entry: WalletEntry): string {
  const parts: string[] = [];
  if (entry.designName) {
    parts.push(entry.designSku ? `${entry.designName} (${entry.designSku})` : entry.designName);
  }
  if (entry.orderNumber) {
    parts.push(`order #${entry.orderNumber}`);
  }
  if (entry.type === 'commission' && entry.baseAmount !== null && entry.rate !== null) {
    parts.push(`${entry.rate}% of ${inr(entry.baseAmount)}`);
  }
  if (entry.type === 'payout' && entry.reference) {
    parts.push(`ref ${entry.reference}`);
  }
  if (parts.length === 0 && entry.description) {
    parts.push(entry.description);
  }
  return parts.join(' · ');
}

export function WalletPanel({
  summary,
  entries,
  holdDays,
  hasPayoutMethod
}: {
  summary: WalletSummary;
  entries: WalletEntry[];
  holdDays: number;
  hasPayoutMethod: boolean;
}) {
  const cards = [
    ['On hold', summary.pending, `Becomes payable ${holdDays} days after delivery`],
    ['Payable', summary.available, `Paid out once it reaches ${inr(summary.minPayout)}`],
    ['Paid out', summary.paidOut, 'Sent to your payout account'],
    ['Lifetime earnings', summary.lifetime, 'Net of refunds and cancellations']
  ] as const;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map(([label, amount, hint]) => (
          <div key={label} className="rounded-md border border-border p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={`text-lg font-semibold ${amount < 0 ? 'text-red-700' : ''}`}>
              {inr(amount)}
            </div>
            <div className="text-xs text-muted-foreground">{hint}</div>
          </div>
        ))}
      </div>
      {summary.available >= summary.minPayout && !hasPayoutMethod && (
        <p className="rounded bg-amber-50 p-2 text-sm text-amber-900">
          You have money waiting. Add your PayPal or bank details in your profile so we can pay you.
        </p>
      )}
      {summary.available < 0 && (
        <p className="rounded bg-neutral-100 p-2 text-sm">
          A refund on an order that was already paid out is taken from your next earnings.
        </p>
      )}
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No earnings yet. When a shopper orders a print of your design, the commission shows here.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 font-normal">Date</th>
                <th className="py-2 pr-3 font-normal">Type</th>
                <th className="py-2 pr-3 font-normal">Details</th>
                <th className="py-2 pr-3 font-normal">Status</th>
                <th className="py-2 text-right font-normal">Amount</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.uuid} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap py-2 pr-3">{day(entry.createdAt)}</td>
                  <td className="py-2 pr-3">{TYPE_LABEL[entry.type] ?? entry.type}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{detail(entry)}</td>
                  <td className="py-2 pr-3">{STATUS_LABEL[entry.status] ?? entry.status}</td>
                  <td
                    className={`whitespace-nowrap py-2 text-right ${
                      entry.amount < 0 ? 'text-red-700' : ''
                    } ${entry.status === 'void' ? 'line-through opacity-60' : ''}`}
                  >
                    {inr(entry.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
