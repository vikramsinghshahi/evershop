import { Button } from '@components/common/ui/Button.js';
import { X } from 'lucide-react';
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
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fabric-chooser-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-[1px]"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
      />
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl">
        <div className="flex shrink-0 items-start gap-4 border-b border-border px-4 py-4 sm:px-6">
          <img
            src={design.image}
            alt=""
            className="h-14 w-14 shrink-0 rounded-md object-cover sm:h-16 sm:w-16"
          />
          <div className="min-w-0 flex-1">
            <h2 id="fabric-chooser-title" className="text-base font-semibold tracking-tight sm:text-lg">
              {design.name}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              by {design.designer.name} · {design.sku}
            </p>
            <p className="mt-2 text-sm text-foreground/80">
              Choose a fabric to print this design on.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {fabrics.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No printable fabrics are on sale right now. Please check back soon.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {fabrics.map((fabric) => (
                <li key={fabric.url}>
                  <a
                    className="group/fabric block overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-foreground/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    href={withDesign(fabric.url, design.uuid)}
                  >
                    <div className="aspect-square overflow-hidden bg-muted/30">
                      {fabric.image ? (
                        <img
                          src={fabric.image}
                          alt=""
                          className="size-full object-cover transition duration-300 group-hover/fabric:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="px-2.5 py-2.5 text-sm font-medium leading-snug">
                      {fabric.name}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
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
          <li key={design.uuid} className="group flex flex-col">
            <button
              type="button"
              className="block w-full overflow-hidden rounded-md border border-border"
              onClick={() => setChosen(design)}
              aria-label={`Print ${design.name}`}
            >
              <img
                src={design.image}
                alt={design.name}
                className="aspect-square w-full object-cover transition duration-500 ease-in-out group-hover:scale-105"
                loading="lazy"
              />
            </button>
            <div className="mt-3 min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{design.name}</div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">
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
            </div>
            <Button
              size="sm"
              variant="default"
              className="mt-3 w-full cursor-pointer"
              onClick={() => setChosen(design)}
            >
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
