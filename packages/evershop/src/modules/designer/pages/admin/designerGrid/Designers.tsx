import { PageHeading } from '@components/admin/PageHeading.js';
import { Button } from '@components/common/ui/Button.js';
import { Card, CardContent } from '@components/common/ui/Card.js';
import { toast } from '@components/common/ui/Sonner.js';
import React from 'react';
import { StatusTabs } from '../../../components/admin/StatusTabs.js';
import { designerApi, fieldClass } from '../../../components/designerApi.js';

interface AdminDesigner {
  uuid: string;
  displayName: string;
  slug: string;
  studioName: string | null;
  status: 'pending' | 'verified' | 'suspended';
  statusLabel: string;
  statusNote: string | null;
  agreementCurrent: boolean;
  payoutMethod: string | null;
  commissionRate: number | null;
  gstin: string | null;
  pan: string | null;
  url: string | null;
  email: string | null;
  customerActive: boolean;
  designCount: number;
  liveCount: number;
  pendingCount: number;
  createdAt: string;
  updateApi: string;
}

type Filter = 'pending' | 'verified' | 'suspended' | 'all';

function DesignerRow({
  designer,
  onChange
}: {
  designer: AdminDesigner;
  onChange: (designer: AdminDesigner) => void;
}) {
  const [busy, setBusy] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [rate, setRate] = React.useState(
    designer.commissionRate === null ? '' : String(designer.commissionRate)
  );
  const [slug, setSlug] = React.useState(designer.slug);

  const update = async (change: Record<string, unknown>, done: string) => {
    setBusy(true);
    try {
      const updated = await designerApi<Partial<AdminDesigner>>(designer.updateApi, 'PATCH', change);
      onChange({ ...designer, ...updated });
      toast.success(done);
      setEditing(false);
    } catch (failure) {
      toast.error((failure as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const suspend = () => {
    const note = window.prompt(
      'Reason for suspending (sent to the designer). Their designs are hidden from shoppers.'
    );
    if (note === null) {
      return;
    }
    if (!note.trim()) {
      toast.error('Give the designer a reason for the suspension.');
      return;
    }
    update({ status: 'suspended', note }, 'Designer suspended.');
  };

  return (
    <tr className="border-b border-border align-top last:border-0">
      <td className="py-3 pr-3">
        <div className="font-medium">{designer.displayName}</div>
        {designer.studioName && <div className="text-xs">{designer.studioName}</div>}
        <div className="text-xs text-muted-foreground">{designer.email ?? 'No customer account'}</div>
        {!designer.customerActive && (
          <div className="text-xs text-red-700">Customer account disabled or deleted</div>
        )}
        {designer.url && (
          <a className="text-xs underline" href={designer.url} target="_blank" rel="noreferrer">
            Public page
          </a>
        )}
      </td>
      <td className="py-3 pr-3 text-sm">
        <div>{designer.statusLabel}</div>
        {designer.statusNote && (
          <div className="text-xs text-muted-foreground">{designer.statusNote}</div>
        )}
        {!designer.agreementCurrent && (
          <div className="text-xs text-amber-700">Agreement not accepted (current version)</div>
        )}
      </td>
      <td className="py-3 pr-3 text-sm">
        {designer.liveCount} live · {designer.pendingCount} in review · {designer.designCount} total
      </td>
      <td className="py-3 pr-3 text-sm">
        <div>{designer.commissionRate === null ? 'Store default' : `${designer.commissionRate}%`}</div>
        <div className="text-xs text-muted-foreground">
          Payout: {designer.payoutMethod ?? 'not set'}
          {designer.gstin && ` · GSTIN ${designer.gstin}`}
          {designer.pan && ` · PAN ${designer.pan}`}
        </div>
      </td>
      <td className="py-3 text-right">
        <div className="flex flex-wrap justify-end gap-2">
          {designer.status !== 'verified' && (
            <Button
              size="xs"
              disabled={busy}
              onClick={() =>
                update(
                  { status: 'verified', note: null },
                  designer.status === 'suspended' ? 'Designer reinstated.' : 'Designer verified.'
                )
              }
            >
              {designer.status === 'suspended' ? 'Reinstate' : 'Verify'}
            </Button>
          )}
          {designer.status !== 'suspended' && (
            <Button size="xs" variant="destructive" disabled={busy} onClick={suspend}>
              Suspend
            </Button>
          )}
          <Button size="xs" variant="outline" disabled={busy} onClick={() => setEditing(!editing)}>
            Settings
          </Button>
        </div>
        {editing && (
          <form
            className="mt-3 space-y-2 text-left"
            onSubmit={(event) => {
              event.preventDefault();
              update({ commissionRate: rate.trim() === '' ? null : rate, slug }, 'Designer updated.');
            }}
          >
            <label className="block text-xs">
              Commission % (blank = store default from Store settings)
              <input
                className={fieldClass}
                type="number"
                min={0}
                max={50}
                step="0.5"
                value={rate}
                onChange={(event) => setRate(event.target.value)}
              />
            </label>
            <label className="block text-xs">
              Profile address
              <input
                className={fieldClass}
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
              />
            </label>
            <Button size="xs" type="submit" disabled={busy}>
              Save
            </Button>
          </form>
        )}
      </td>
    </tr>
  );
}

export default function Designers({ adminDesigners }: { adminDesigners: AdminDesigner[] }) {
  const [designers, setDesigners] = React.useState(adminDesigners ?? []);
  const [filter, setFilter] = React.useState<Filter>(
    designers.some((designer) => designer.status === 'pending') ? 'pending' : 'all'
  );
  const count = (status: Filter) =>
    status === 'all' ? designers.length : designers.filter((d) => d.status === status).length;
  const shown = filter === 'all' ? designers : designers.filter((d) => d.status === filter);
  return (
    <div className="main-content-inner">
      <PageHeading heading="Designers" />
      <Card>
        <CardContent>
          <StatusTabs<Filter>
            active={filter}
            onChange={setFilter}
            tabs={[
              { id: 'pending', label: 'Waiting for verification', count: count('pending') },
              { id: 'verified', label: 'Verified', count: count('verified') },
              { id: 'suspended', label: 'Suspended', count: count('suspended') },
              { id: 'all', label: 'All', count: count('all') }
            ]}
          />
          {shown.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No designers here.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-2 pr-3 font-normal">Designer</th>
                    <th className="py-2 pr-3 font-normal">Status</th>
                    <th className="py-2 pr-3 font-normal">Designs</th>
                    <th className="py-2 pr-3 font-normal">Commission</th>
                    <th className="py-2 text-right font-normal">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((designer) => (
                    <DesignerRow
                      key={designer.uuid}
                      designer={designer}
                      onChange={(updated) =>
                        setDesigners((list) =>
                          list.map((item) => (item.uuid === updated.uuid ? updated : item))
                        )
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
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
    adminDesigners
  }
`;
