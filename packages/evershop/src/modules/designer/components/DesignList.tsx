import { Button } from '@components/common/ui/Button.js';
import { toast } from '@components/common/ui/Sonner.js';
import React from 'react';
import { designerApi } from './designerApi.js';
import {
  type DesignDraft,
  DesignFields,
  type DesignOptions,
  draftPayload,
  REPEAT_LABELS
} from './DesignFields.js';

export interface OwnDesign {
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
  canEdit: boolean;
  canSubmit: boolean;
  canWithdraw: boolean;
  canDelete: boolean;
  createdAt: string | null;
}

const STATUS_TONE: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  rejected: 'bg-red-100 text-red-800',
  hidden: 'bg-neutral-200 text-neutral-700',
  withdrawn: 'bg-neutral-200 text-neutral-700',
  draft: 'bg-neutral-100 text-neutral-700'
};

function toDraft(design: OwnDesign): DesignDraft {
  return {
    name: design.name,
    description: design.description ?? '',
    category: design.category,
    colors: design.colors,
    tags: design.tags.join(', '),
    repeatType: design.repeatType
  };
}

function DesignCard({
  design,
  base,
  options,
  canSubmit,
  onChange,
  onDeleted
}: {
  design: OwnDesign;
  base: string;
  options: DesignOptions;
  canSubmit: boolean;
  onChange: (design: OwnDesign) => void;
  onDeleted: (uuid: string) => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<DesignDraft>(() => toDraft(design));
  const [busy, setBusy] = React.useState(false);
  const url = `${base}/${design.uuid}`;

  const run = async (work: () => Promise<void>) => {
    setBusy(true);
    try {
      await work();
    } catch (failure) {
      toast.error((failure as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.category.trim()) {
      toast.error('Choose a category.');
      return;
    }
    if (draft.colors.length === 0) {
      toast.error('Pick at least one main colour.');
      return;
    }
    run(async () => {
      const updated = await designerApi<OwnDesign>(url, 'PATCH', draftPayload(draft));
      onChange(updated);
      setEditing(false);
      toast.success('Design updated.');
    });
  };

  const act = (action: 'submit' | 'withdraw') =>
    run(async () => {
      if (
        action === 'withdraw' &&
        !window.confirm(
          'Withdraw this design? Shoppers will no longer see it. Orders already placed still earn commission.'
        )
      ) {
        return;
      }
      const updated = await designerApi<OwnDesign>(`${url}/action`, 'POST', { action });
      onChange(updated);
      toast.success(action === 'submit' ? 'Sent for review.' : 'Design withdrawn.');
    });

  const remove = () =>
    run(async () => {
      if (!window.confirm('Delete this design permanently?')) {
        return;
      }
      await designerApi(url, 'DELETE');
      onDeleted(design.uuid);
      toast.success('Design deleted.');
    });

  return (
    <li className="rounded-md border border-border p-3">
      <div className="flex gap-3">
        <img
          src={design.image}
          alt={design.name}
          className="h-24 w-24 shrink-0 rounded object-cover"
          loading="lazy"
        />
        <div className="min-w-0 flex-1 space-y-1 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{design.name}</span>
            <span
              className={`rounded px-1.5 py-0.5 text-xs ${STATUS_TONE[design.status] ?? ''}`}
            >
              {design.statusLabel}
            </span>
            {design.sku && <span className="text-xs text-muted-foreground">{design.sku}</span>}
          </div>
          <div className="text-xs text-muted-foreground">
            {design.category} · {REPEAT_LABELS[design.repeatType] ?? design.repeatType} ·{' '}
            {design.width} × {design.height} px · {design.salesCount} sold
          </div>
          {design.reviewNote && ['rejected', 'hidden'].includes(design.status) && (
            <p className="rounded bg-red-50 p-2 text-xs text-red-800">
              Note from the shop: {design.reviewNote}
            </p>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {design.canEdit && !editing && (
              <Button size="xs" variant="outline" disabled={busy} onClick={() => setEditing(true)}>
                Edit details
              </Button>
            )}
            {design.canSubmit && (
              <Button
                size="xs"
                disabled={busy || !canSubmit}
                title={canSubmit ? '' : 'Accept the current Seller Agreement first'}
                onClick={() => act('submit')}
              >
                {design.status === 'rejected' ? 'Resubmit' : 'Send for review'}
              </Button>
            )}
            {design.canWithdraw && (
              <Button size="xs" variant="outline" disabled={busy} onClick={() => act('withdraw')}>
                Withdraw
              </Button>
            )}
            {design.canDelete && (
              <Button size="xs" variant="destructive" disabled={busy} onClick={remove}>
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
      {editing && (
        <form className="mt-3 space-y-3 border-t border-border pt-3" onSubmit={save}>
          {design.status === 'approved' && (
            <p className="text-xs text-muted-foreground">
              Changes to a live design show straight away. A replacement artwork needs a new upload.
            </p>
          )}
          <DesignFields
            draft={draft}
            options={options}
            idPrefix={`edit-${design.uuid}`}
            onChange={setDraft}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={busy}>
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft(toDraft(design));
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </li>
  );
}

export function DesignList({
  designs,
  base,
  options,
  canSubmit,
  onChange,
  onDeleted
}: {
  designs: OwnDesign[];
  base: string;
  options: DesignOptions;
  canSubmit: boolean;
  onChange: (design: OwnDesign) => void;
  onDeleted: (uuid: string) => void;
}) {
  if (designs.length === 0) {
    return <p className="text-sm text-muted-foreground">You have not uploaded any designs yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {designs.map((design) => (
        <DesignCard
          key={design.uuid}
          design={design}
          base={base}
          options={options}
          canSubmit={canSubmit}
          onChange={onChange}
          onDeleted={onDeleted}
        />
      ))}
    </ul>
  );
}
