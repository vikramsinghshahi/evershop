import { PageHeading } from '@components/admin/PageHeading.js';
import { Button } from '@components/common/ui/Button.js';
import { Card, CardContent } from '@components/common/ui/Card.js';
import { toast } from '@components/common/ui/Sonner.js';
import React from 'react';
import { designerApi, fieldClass } from '../../../components/designerApi.js';
import { inr } from '../../../components/SellerAgreement.js';

interface Balance {
  uuid: string;
  name: string;
  status: string;
  email: string | null;
  payoutMethod: 'paypal' | 'bank' | null;
  payoutTo: string | null;
  payoutBank: { accountName: string; accountNumber: string; ifsc: string; bankName: string } | null;
  pending: number;
  available: number;
  paidOut: number;
  lastPayoutAt: string | null;
}

interface Payout {
  uuid: string;
  designer: string;
  amount: number;
  method: string;
  reference: string;
  note: string | null;
  paidBy: string | null;
  createdAt: string;
}

interface PayoutData {
  minPayout: number;
  recordApi: string;
  balances: Balance[];
  payouts: Payout[];
}

function day(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—';
}

function PayForm({
  balance,
  api,
  onPaid,
  onCancel
}: {
  balance: Balance;
  api: string;
  onPaid: () => void;
  onCancel: () => void;
}) {
  const [reference, setReference] = React.useState('');
  const [note, setNote] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !window.confirm(
        `Record a payout of ${inr(balance.available)} to ${balance.name}? Only do this after the money has been sent.`
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const result = await designerApi<{ amount: number }>(api, 'POST', {
        designer: balance.uuid,
        reference,
        note
      });
      toast.success(`Recorded ${inr(result.amount)} paid to ${balance.name}.`);
      onPaid();
    } catch (failure) {
      toast.error((failure as Error).message);
      setBusy(false);
    }
  };
  return (
    <form className="mt-3 space-y-2 rounded-md border border-border p-3 text-left" onSubmit={submit}>
      <div className="text-xs">
        Send {inr(balance.available)} by {balance.payoutMethod === 'paypal' ? 'PayPal' : 'bank transfer'} to:
      </div>
      {balance.payoutMethod === 'paypal' && (
        <div className="font-mono text-xs">{balance.payoutTo}</div>
      )}
      {balance.payoutBank && (
        <div className="font-mono text-xs">
          {balance.payoutBank.accountName}
          <br />
          A/C {balance.payoutBank.accountNumber} · IFSC {balance.payoutBank.ifsc}
          {balance.payoutBank.bankName && (
            <>
              <br />
              {balance.payoutBank.bankName}
            </>
          )}
        </div>
      )}
      <input
        className={fieldClass}
        placeholder="Transaction reference (PayPal ID, UTR)"
        value={reference}
        required
        minLength={3}
        maxLength={120}
        onChange={(event) => setReference(event.target.value)}
      />
      <input
        className={fieldClass}
        placeholder="Note (optional)"
        value={note}
        maxLength={300}
        onChange={(event) => setNote(event.target.value)}
      />
      <div className="flex gap-2">
        <Button size="sm" type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Mark as paid'}
        </Button>
        <Button size="sm" type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function DesignerPayouts({
  adminDesignerPayouts
}: {
  adminDesignerPayouts: PayoutData;
}) {
  const data = adminDesignerPayouts;
  const [paying, setPaying] = React.useState<string | null>(null);
  const due = data.balances.filter((balance) => balance.available >= data.minPayout);
  return (
    <div className="main-content-inner space-y-4">
      <PageHeading heading="Designer payouts" />
      <Card>
        <CardContent>
          <p className="mb-3 text-sm text-muted-foreground">
            Commission becomes payable after the hold period once an order is completed. Pay
            designers whose payable balance is at least {inr(data.minPayout)}, then record the
            transfer here. {due.length} designer{due.length === 1 ? '' : 's'} due.
          </p>
          {data.balances.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No designer earnings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-2 pr-3 font-normal">Designer</th>
                    <th className="py-2 pr-3 text-right font-normal">On hold</th>
                    <th className="py-2 pr-3 text-right font-normal">Payable</th>
                    <th className="py-2 pr-3 text-right font-normal">Paid out</th>
                    <th className="py-2 pr-3 font-normal">Payout to</th>
                    <th className="py-2 text-right font-normal" />
                  </tr>
                </thead>
                <tbody>
                  {data.balances.map((balance) => {
                    const canPay =
                      balance.available >= data.minPayout && balance.available > 0 && balance.payoutMethod;
                    return (
                      <tr key={balance.uuid} className="border-b border-border align-top last:border-0">
                        <td className="py-3 pr-3">
                          <div className="font-medium">{balance.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {balance.email} · {balance.status} · last paid {day(balance.lastPayoutAt)}
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-right">{inr(balance.pending)}</td>
                        <td
                          className={`py-3 pr-3 text-right font-medium ${
                            balance.available < 0 ? 'text-red-700' : ''
                          }`}
                        >
                          {inr(balance.available)}
                        </td>
                        <td className="py-3 pr-3 text-right">{inr(balance.paidOut)}</td>
                        <td className="py-3 pr-3 text-xs">
                          {balance.payoutTo ?? (
                            <span className="text-amber-700">Designer has not added payout details</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {paying === balance.uuid ? (
                            <PayForm
                              balance={balance}
                              api={data.recordApi}
                              onPaid={() => window.location.reload()}
                              onCancel={() => setPaying(null)}
                            />
                          ) : (
                            <Button
                              size="xs"
                              disabled={!canPay}
                              title={
                                canPay
                                  ? ''
                                  : balance.payoutMethod
                                    ? `Payable balance is below ${inr(data.minPayout)}`
                                    : 'No payout details'
                              }
                              onClick={() => setPaying(balance.uuid)}
                            >
                              Pay
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <h2 className="mb-3 font-medium">Recent payouts</h2>
          {data.payouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payouts recorded yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pr-3 font-normal">Date</th>
                  <th className="py-2 pr-3 font-normal">Designer</th>
                  <th className="py-2 pr-3 font-normal">Method</th>
                  <th className="py-2 pr-3 font-normal">Reference</th>
                  <th className="py-2 pr-3 font-normal">Recorded by</th>
                  <th className="py-2 text-right font-normal">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.payouts.map((payout) => (
                  <tr key={payout.uuid} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3">{day(payout.createdAt)}</td>
                    <td className="py-2 pr-3">{payout.designer}</td>
                    <td className="py-2 pr-3">{payout.method}</td>
                    <td className="py-2 pr-3">
                      {payout.reference}
                      {payout.note && (
                        <div className="text-xs text-muted-foreground">{payout.note}</div>
                      )}
                    </td>
                    <td className="py-2 pr-3">{payout.paidBy ?? '—'}</td>
                    <td className="py-2 text-right">{inr(payout.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    adminDesignerPayouts
  }
`;
