import { PageHeading } from '@components/admin/PageHeading.js';
import { Button } from '@components/common/ui/Button.js';
import { Card, CardContent } from '@components/common/ui/Card.js';
import { toast } from '@components/common/ui/Sonner.js';
import React from 'react';
import { StatusTabs } from '../../../components/admin/StatusTabs.js';
import { designerApi } from '../../../components/designerApi.js';
import { REPEAT_LABELS } from '../../../components/DesignFields.js';

interface ReviewItem {
  uuid: string;
  sku: string | null;
  name: string;
  description: string | null;
  category: string;
  colors: string[];
  tags: string[];
  repeatType: string;
  image: string;
  width: number;
  height: number;
  dpi: number | null;
  status: string;
  statusLabel: string;
  reviewNote: string | null;
  salesCount: number;
  submittedAt: string | null;
  designerName: string;
  designerStatus: string;
  originalName: string | null;
  downloadUrl: string;
  reviewApi: string;
}

type Filter = 'pending' | 'approved' | 'rejected' | 'hidden' | 'withdrawn';
type Action = 'approve' | 'reject' | 'hide' | 'restore';

const ACTIONS: Record<string, Action[]> = {
  pending: ['approve', 'reject'],
  approved: ['hide'],
  rejected: ['approve'],
  hidden: ['restore']
};

const ACTION_LABEL: Record<Action, string> = {
  approve: 'Approve',
  reject: 'Reject',
  hide: 'Hide',
  restore: 'Restore'
};

const DONE_LABEL: Record<Action, string> = {
  approve: 'approved and live',
  reject: 'sent back to the designer',
  hide: 'hidden from shoppers',
  restore: 'live again'
};

function ReviewCard({
  item,
  onChange
}: {
  item: ReviewItem;
  onChange: (item: ReviewItem) => void;
}) {
  const [note, setNote] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const designerReady = item.designerStatus === 'verified';

  const act = async (action: Action) => {
    if ((action === 'reject' || action === 'hide') && !note.trim()) {
      toast.error('Write a note so the designer knows what to change.');
      return;
    }
    setBusy(true);
    try {
      const updated = await designerApi<Partial<ReviewItem>>(item.reviewApi, 'POST', {
        action,
        note: note.trim() || null
      });
      onChange({ ...item, ...updated });
      setNote('');
      toast.success(`${item.name}: ${DONE_LABEL[action]}.`);
    } catch (failure) {
      toast.error((failure as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const lowRes = Math.min(item.width, item.height) < 1500;
  return (
    <li className="flex flex-col gap-4 border-b border-border py-4 last:border-0 md:flex-row">
      <a href={item.image} target="_blank" rel="noreferrer" className="shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="h-40 w-40 rounded object-cover"
          loading="lazy"
        />
      </a>
      <div className="min-w-0 flex-1 space-y-1 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{item.name}</span>
          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">{item.statusLabel}</span>
          {item.sku && <span className="text-xs text-muted-foreground">{item.sku}</span>}
        </div>
        <div>
          by {item.designerName}
          {!designerReady && (
            <span className="ml-2 text-xs text-amber-700">
              Designer is {item.designerStatus}. Verify the designer before approving.
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {item.category} · {item.colors.join(', ')} ·{' '}
          {REPEAT_LABELS[item.repeatType] ?? item.repeatType}
          {item.tags.length > 0 && ` · ${item.tags.join(', ')}`}
        </div>
        <div className={`text-xs ${lowRes ? 'text-amber-700' : 'text-muted-foreground'}`}>
          {item.width} × {item.height} px{item.dpi ? ` · ${item.dpi} DPI` : ''}
          {lowRes && ' · low resolution, check print quality'}
        </div>
        {item.description && <p className="text-xs">{item.description}</p>}
        {item.reviewNote && (
          <p className="text-xs text-muted-foreground">Last note: {item.reviewNote}</p>
        )}
        <a className="text-xs underline" href={item.downloadUrl}>
          Download original{item.originalName ? ` (${item.originalName})` : ''}
        </a>
        {(ACTIONS[item.status] ?? []).length > 0 && (
          <div className="space-y-2 pt-2">
            <textarea
              className="w-full rounded-md border border-border p-2 text-sm"
              rows={2}
              maxLength={500}
              placeholder="Note to the designer (required to reject or hide)"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {(ACTIONS[item.status] ?? []).map((action) => (
                <Button
                  key={action}
                  size="sm"
                  variant={action === 'reject' || action === 'hide' ? 'destructive' : 'default'}
                  disabled={busy || ((action === 'approve' || action === 'restore') && !designerReady)}
                  onClick={() => act(action)}
                >
                  {ACTION_LABEL[action]}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

export default function DesignReview({ adminDesignReview }: { adminDesignReview: ReviewItem[] }) {
  const [items, setItems] = React.useState(adminDesignReview ?? []);
  const [filter, setFilter] = React.useState<Filter>('pending');
  const count = (status: Filter) => items.filter((item) => item.status === status).length;
  const shown = items.filter((item) => item.status === filter);
  return (
    <div className="main-content-inner">
      <PageHeading heading="Design review" />
      <Card>
        <CardContent>
          <StatusTabs<Filter>
            active={filter}
            onChange={setFilter}
            tabs={[
              { id: 'pending', label: 'Waiting for review', count: count('pending') },
              { id: 'approved', label: 'Live', count: count('approved') },
              { id: 'rejected', label: 'Rejected', count: count('rejected') },
              { id: 'hidden', label: 'Hidden', count: count('hidden') },
              { id: 'withdrawn', label: 'Withdrawn', count: count('withdrawn') }
            ]}
          />
          {shown.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nothing here.</p>
          ) : (
            <ul>
              {shown.map((item) => (
                <ReviewCard
                  key={item.uuid}
                  item={item}
                  onChange={(updated) =>
                    setItems((list) => list.map((row) => (row.uuid === updated.uuid ? updated : row)))
                  }
                />
              ))}
            </ul>
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
    adminDesignReview
  }
`;
