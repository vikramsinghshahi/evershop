import { Button } from '@components/common/ui/Button.js';
import {
  DialogClose,
  DialogDescription,
  DialogTitle
} from '@components/common/ui/Dialog.js';
import { Input } from '@components/common/ui/Input.js';
import { Check } from 'lucide-react';
import React from 'react';
import { DesignerSelect } from '../../designer/components/DesignerSelect.js';
import { DESIGN_CATEGORIES, DESIGN_COLORS } from '../../designer/services/designerRules.js';
import type { PrintDesignSelection } from '../services/printDesignView.js';

const CATALOG_API = '/api/designer/catalog';
/** Four full rows at five columns. The catalog API caps a page at 48. */
const PAGE_SIZE = 20;

/** Set by the design gallery's "Print this design" before it opens the fabrics. */
export const PENDING_DESIGN_KEY = 'fabricPendingDesign';

export interface LibraryDesign {
  uuid: string;
  sku: string | null;
  name: string;
  image: string;
  category: string;
  repeatType: string;
  designer: { name: string; slug: string; url: string };
}

interface CatalogResponse {
  data?: {
    items: LibraryDesign[];
    total: number;
    page: number;
    designers?: { slug: string; name: string; count: number }[];
  };
  error?: { message?: string };
}

export function designerSelection(design: LibraryDesign): PrintDesignSelection {
  return {
    source: 'designer',
    designId: design.uuid,
    name: design.name,
    image: design.image,
    designerName: design.designer.name,
    repeatType: design.repeatType
  };
}

export async function fetchLiveDesign(uuid: string): Promise<LibraryDesign | null> {
  const response = await fetch(`${CATALOG_API}?id=${encodeURIComponent(uuid)}&limit=1`);
  const json = (await response.json()) as CatalogResponse;
  return json.data?.items?.[0] ?? null;
}

function libraryDraft(selection: PrintDesignSelection | null): PrintDesignSelection | null {
  if (!selection || selection.source !== 'designer') {
    return null;
  }
  return selection;
}

/** Empty-string values are not valid in the storefront select. */
const ALL = '__all__';

const SORT_OPTIONS = [
  { value: 'new', label: 'Newest' },
  { value: 'best', label: 'Best selling' }
];

const gridClass = 'grid grid-cols-2 gap-3 @md:grid-cols-3 @5xl:grid-cols-5';

function DesignCard({
  id,
  name,
  image,
  caption,
  selected,
  fit,
  onSelect
}: {
  id: string;
  name: string;
  image: string;
  caption?: string;
  selected: boolean;
  fit: 'object-cover' | 'object-contain';
  onSelect: () => void;
}) {
  const [broken, setBroken] = React.useState(false);

  return (
    <button
      type="button"
      id={`design-option-${id}`}
      aria-pressed={selected}
      className={`group relative min-w-0 border bg-card p-1.5 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        selected
          ? 'border-primary ring-2 ring-primary'
          : 'border-border hover:border-foreground/40'
      }`}
      onClick={onSelect}
    >
      {selected && (
        <span className="absolute top-2 right-2 z-10 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3" aria-hidden="true" />
        </span>
      )}
      {broken ? (
        <span className="flex aspect-square w-full items-center justify-center bg-muted px-1 text-center text-[10px] text-muted-foreground">
          No image
        </span>
      ) : (
        <img
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          className={`aspect-square w-full bg-muted ${fit}`}
          onError={() => setBroken(true)}
        />
      )}
      <span className="mt-1 block truncate font-medium">{name}</span>
      {caption ? <span className="block truncate text-muted-foreground">{caption}</span> : null}
    </button>
  );
}

/**
 * Choose design from the designer library. A click only highlights a design.
 * Use, in the footer, applies it.
 */
export function DesignLibrary({
  applied,
  onUse
}: {
  applied: PrintDesignSelection | null;
  onUse: (selection: PrintDesignSelection) => void;
}) {
  const [draft, setDraft] = React.useState<PrintDesignSelection | null>(() => libraryDraft(applied));
  const [category, setCategory] = React.useState('');
  const [color, setColor] = React.useState('');
  const [designer, setDesigner] = React.useState('');
  const [sort, setSort] = React.useState('new');
  const [search, setSearch] = React.useState('');
  const [q, setQ] = React.useState('');
  const [items, setItems] = React.useState<LibraryDesign[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [designers, setDesigners] = React.useState<{ slug: string; name: string; count: number }[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [footerBroken, setFooterBroken] = React.useState(false);
  const firstLoad = React.useRef(true);
  const latest = React.useRef(0);
  const busy = React.useRef(false);
  const abortRef = React.useRef<AbortController | null>(null);
  const using = React.useRef(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const itemsRef = React.useRef<LibraryDesign[]>([]);
  itemsRef.current = items;

  React.useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
    setFooterBroken(false);
  }, [draft?.designId, draft?.image]);

  const load = React.useCallback(
    async (nextPage: number) => {
      if (nextPage !== 1 && busy.current) {
        return;
      }
      busy.current = true;
      latest.current += 1;
      const request = latest.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setFailed(false);
      if (nextPage === 1) {
        itemsRef.current = [];
        setItems([]);
        setTotal(0);
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
      }
      const params = new URLSearchParams({ page: String(nextPage), limit: String(PAGE_SIZE), sort });
      if (category) params.set('category', category);
      if (color) params.set('color', color);
      if (designer) params.set('designer', designer);
      if (q) params.set('q', q);
      if (firstLoad.current) params.set('withDesigners', '1');
      try {
        const response = await fetch(`${CATALOG_API}?${params.toString()}`, {
          signal: controller.signal
        });
        const json = (await response.json()) as CatalogResponse;
        if (request !== latest.current) {
          return;
        }
        if (!response.ok || !json.data) {
          throw new Error(json.error?.message);
        }
        const data = json.data;
        if (data.designers) {
          setDesigners(data.designers);
          firstLoad.current = false;
        }
        const current = itemsRef.current;
        const seen = new Set(current.map((item) => item.uuid));
        const added = data.items.filter((item) => !seen.has(item.uuid));
        // An empty or duplicate page means there is nothing further to append.
        // Trusting `total` alone would keep the sentinel asking for the next page.
        const nextItems = nextPage === 1 ? data.items : added.length === 0 ? current : [...current, ...added];
        const nextTotal =
          data.items.length === 0 || (nextPage > 1 && added.length === 0) ? nextItems.length : data.total;
        itemsRef.current = nextItems;
        setItems(nextItems);
        setTotal(nextTotal);
        setPage(nextPage);
      } catch {
        if (controller.signal.aborted || request !== latest.current) {
          return;
        }
        setFailed(true);
      } finally {
        if (request !== latest.current) {
          return;
        }
        busy.current = false;
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [category, color, designer, q, sort]
  );

  React.useEffect(() => {
    load(1);
    return () => {
      abortRef.current?.abort();
    };
  }, [load]);

  const hasMore = items.length < total;
  React.useEffect(() => {
    const root = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel || failed || !hasMore) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }
        if (busy.current) {
          return;
        }
        load(page + 1);
      },
      { root, rootMargin: '240px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [failed, hasMore, load, page]);

  const categoryOptions = React.useMemo(
    () => [
      { value: ALL, label: 'All categories' },
      ...DESIGN_CATEGORIES.map((value) => ({ value, label: value }))
    ],
    []
  );
  const colorOptions = React.useMemo(
    () => [
      { value: ALL, label: 'All colours' },
      ...DESIGN_COLORS.map((value) => ({ value, label: value }))
    ],
    []
  );
  const designerOptions = React.useMemo(
    () => [
      { value: ALL, label: 'All designers' },
      ...designers
        .filter((entry) => entry.slug && entry.slug !== ALL)
        .map((entry) => ({
          value: entry.slug,
          label: `${entry.name} (${entry.count})`
        }))
    ],
    [designers]
  );

  const filtered = Boolean(category || color || designer || q);
  const draftHidden =
    draft?.source === 'designer' &&
    filtered &&
    !loading &&
    !failed &&
    items.length > 0 &&
    items.length >= total &&
    !items.some((item) => item.uuid === draft.designId);

  const clearFilters = () => {
    setCategory('');
    setColor('');
    setDesigner('');
    setSearch('');
    setQ('');
  };

  const useDraft = () => {
    if (!draft || draft.source !== 'designer' || using.current) {
      return;
    }
    using.current = true;
    onUse(draft);
  };

  return (
    <div className="@container flex min-h-0 w-full flex-col">
      <div className="shrink-0 border-b border-border px-5 pt-5 pr-14 pb-4">
        <DialogTitle className="text-base font-semibold tracking-tight">Choose a design</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">
          Select one design from the library, then use it on this fabric.
        </DialogDescription>
      </div>

      <div className="max-h-[38%] shrink-0 overflow-y-auto border-b border-border px-5 py-3">
          <div className="grid grid-cols-2 gap-2 @5xl:grid-cols-4">
            <Input
              type="search"
              value={search}
              placeholder="Search name, tag, code"
              aria-label="Search designs"
              autoComplete="off"
              className="col-span-2 h-9 bg-background @5xl:col-span-4"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                }
              }}
            />
            <DesignerSelect
              label="Category"
              value={category || ALL}
              onChange={(next) => setCategory(next === ALL ? '' : next)}
              options={categoryOptions}
            />
            <DesignerSelect
              label="Colour"
              value={color || ALL}
              onChange={(next) => setColor(next === ALL ? '' : next)}
              options={colorOptions}
            />
            <DesignerSelect
              label="Designer"
              value={designer || ALL}
              onChange={(next) => setDesigner(next === ALL ? '' : next)}
              options={designerOptions}
            />
            <DesignerSelect
              label="Sort"
              value={sort === 'best' ? 'best' : 'new'}
              onChange={setSort}
              options={SORT_OPTIONS}
            />
          </div>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 overflow-y-auto overscroll-contain px-5 py-4"
      >
            {failed && items.length === 0 && (
              <p className="py-10 text-center text-sm text-red-700">
                Designs could not be loaded.{' '}
                <button type="button" className="underline" onClick={() => load(1)}>
                  Try again
                </button>
              </p>
            )}

            {!failed && !loading && items.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                <p>
                  {filtered
                    ? 'No designs match these filters.'
                    : 'No designs are live yet. Upload your own, or check back soon.'}
                </p>
                {filtered && (
                  <button type="button" className="mt-2 underline" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {loading && items.length === 0 && !failed && (
              <div className={gridClass} aria-hidden="true">
                {Array.from({ length: 10 }, (_, index) => (
                  <div key={index} className="border border-border p-1.5">
                    <div className="aspect-square w-full animate-pulse bg-muted" />
                    <div className="mt-2 h-3 w-2/3 animate-pulse bg-muted" />
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className={gridClass} role="group" aria-label="Designer library" aria-busy={loading}>
                {items.map((design) => (
                  <DesignCard
                    key={design.uuid}
                    id={design.uuid}
                    name={design.name}
                    image={design.image}
                    caption={`by ${design.designer.name}`}
                    selected={draft?.designId === design.uuid}
                    fit="object-cover"
                    onSelect={() => setDraft(designerSelection(design))}
                  />
                ))}
              </div>
            )}

            <div ref={sentinelRef} className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {total > 0 ? `${Math.min(items.length, total)} of ${total}` : ''}
                {loading && items.length > 0 ? ' Loading…' : ''}
              </span>
              {failed && items.length > 0 && (
                <button type="button" className="underline" onClick={() => load(page + 1)}>
                  Try again
                </button>
              )}
              {hasMore && !failed && (
                <button
                  type="button"
                  className="underline disabled:opacity-50"
                  disabled={loading}
                  onClick={() => load(page + 1)}
                >
                  Show more
                </button>
              )}
            </div>

            {draftHidden && (
              <p className="mt-3 text-xs text-muted-foreground">
                The selected design is hidden by these filters.{' '}
                <button type="button" className="underline" onClick={clearFilters}>
                  Clear filters
                </button>
              </p>
            )}

            <div className="mt-4 flex justify-between text-xs">
              <a className="underline" href="/designs">
                Browse all designs
              </a>
              <a className="underline" href="/account/designer">
                Sell your designs
              </a>
            </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3 border-t border-border bg-background px-5 py-3 sm:flex-row sm:items-center">
        {draft ? (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {footerBroken ? (
              <span className="flex size-12 shrink-0 items-center justify-center border border-border bg-muted text-[10px] text-muted-foreground">
                No image
              </span>
            ) : (
              <img
                src={draft.image}
                alt=""
                className="size-12 shrink-0 border border-border bg-muted object-cover"
                onError={() => setFooterBroken(true)}
              />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{draft.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {draft.designerName ? `by ${draft.designerName}` : 'Design library'}
              </p>
            </div>
          </div>
        ) : (
          <p className="min-w-0 flex-1 text-sm text-muted-foreground">
            Select a design to continue.
          </p>
        )}
        <div className="flex gap-2 sm:shrink-0">
          <DialogClose render={<Button type="button" variant="outline" className="flex-1 sm:flex-none" />}>
            Cancel
          </DialogClose>
          <Button
            type="button"
            className="flex-1 sm:flex-none"
            disabled={!draft}
            aria-label={draft ? `Use ${draft.name}` : 'Use'}
            title={draft ? undefined : 'Select a design first'}
            onClick={useDraft}
          >
            Use
          </Button>
        </div>
      </div>
    </div>
  );
}
