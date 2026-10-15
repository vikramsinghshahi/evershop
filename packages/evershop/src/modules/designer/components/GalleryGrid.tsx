import { Button } from '@components/common/ui/Button.js';
import React from 'react';
import { REPEAT_LABELS } from './DesignFields.js';

export interface GalleryDesign {
  uuid: string;
  sku: string;
  name: string;
  category: string;
  repeatType: string;
  image: string;
  designer: { name: string; slug: string; url: string };
}

export interface PrintFabric {
  name: string;
  url: string;
  image: string | null;
}

function withDesign(url: string, uuid: string): string {
  return `${url}${url.includes('?') ? '&' : '?'}design=${encodeURIComponent(uuid)}`;
}

function FabricChooser({
  design,
  fabrics,
  onClose
}: {
  design: GalleryDesign;
  fabrics: PrintFabric[];
  onClose: () => void;
}) {
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Choose a fabric for ${design.name}`}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/40"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
      />
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-background p-5">
        <div className="mb-4 flex items-start gap-3">
          <img src={design.image} alt="" className="h-16 w-16 rounded object-cover" />
          <div className="min-w-0 flex-1">
            <div className="font-medium">{design.name}</div>
            <div className="text-xs text-muted-foreground">
              by {design.designer.name} · {design.sku}
            </div>
            <div className="mt-1 text-sm">Choose the fabric to print it on.</div>
          </div>
          <button type="button" className="text-sm text-muted-foreground" onClick={onClose}>
            Close
          </button>
        </div>
        {fabrics.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No printable fabrics are on sale right now. Please check back soon.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3">
            {fabrics.map((fabric) => (
              <li key={fabric.url}>
                <a
                  className="block rounded-md border border-border p-2 text-sm hover:border-foreground"
                  href={withDesign(fabric.url, design.uuid)}
                >
                  {fabric.image && (
                    <img
                      src={fabric.image}
                      alt=""
                      className="mb-2 aspect-square w-full rounded object-cover"
                      loading="lazy"
                    />
                  )}
                  {fabric.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function GalleryGrid({
  designs,
  fabrics,
  showDesigner = true
}: {
  designs: GalleryDesign[];
  fabrics: PrintFabric[];
  showDesigner?: boolean;
}) {
  const [chosen, setChosen] = React.useState<GalleryDesign | null>(null);
  const close = React.useCallback(() => setChosen(null), []);
  return (
    <>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {designs.map((design) => (
          <li key={design.uuid} className="group">
            <button
              type="button"
              className="block w-full overflow-hidden rounded-md border border-border"
              onClick={() => setChosen(design)}
              aria-label={`Print ${design.name}`}
            >
              <img
                src={design.image}
                alt={design.name}
                className="aspect-square w-full object-cover transition group-hover:scale-105"
                loading="lazy"
              />
            </button>
            <div className="mt-2 text-sm font-medium">{design.name}</div>
            <div className="text-xs text-muted-foreground">
              {showDesigner && (
                <>
                  by{' '}
                  <a className="hover:underline" href={design.designer.url}>
                    {design.designer.name}
                  </a>{' '}
                  ·{' '}
                </>
              )}
              {design.sku} · {REPEAT_LABELS[design.repeatType] ?? design.repeatType}
            </div>
            <Button size="xs" variant="outline" className="mt-2" onClick={() => setChosen(design)}>
              Print this design
            </Button>
          </li>
        ))}
      </ul>
      {chosen && <FabricChooser design={chosen} fabrics={fabrics} onClose={close} />}
    </>
  );
}

export function GalleryPager({
  page,
  total,
  limit,
  filters
}: {
  page: number;
  total: number;
  limit: number;
  filters: Record<string, string | null>;
}) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) {
    return null;
  }
  const href = (target: number) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    params.set('page', String(target));
    return `?${params.toString()}`;
  };
  return (
    <nav className="mt-8 flex items-center justify-center gap-4 text-sm" aria-label="Pages">
      {page > 1 ? <a href={href(page - 1)}>← Previous</a> : <span />}
      <span className="text-muted-foreground">
        Page {page} of {pages}
      </span>
      {page < pages ? <a href={href(page + 1)}>Next →</a> : <span />}
    </nav>
  );
}
