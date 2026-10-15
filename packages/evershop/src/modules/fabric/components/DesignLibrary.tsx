import React from 'react';
import { DESIGN_CATEGORIES, DESIGN_COLORS } from '../../designer/services/designerRules.js';
import { CATALOG_DESIGNS } from '../services/designCatalog.js';
import type { PrintDesignSelection } from '../services/printDesignView.js';

const CATALOG_API = '/api/designer/catalog';
const PAGE_SIZE = 12;

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

const selectClass =
  'min-w-0 border border-neutral-300 bg-white px-2 py-1.5 text-xs text-neutral-800';

/**
 * Choose design: the designer marketplace first, then the shop's own basic
 * patterns. Filters mirror the gallery: category, colour, designer, search.
 */
export function DesignLibrary({
  selectedId,
  onPick
}: {
  selectedId: string | null;
  onPick: (selection: PrintDesignSelection) => void;
}) {
  const [tab, setTab] = React.useState<'designers' | 'basics'>('designers');
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
  const firstLoad = React.useRef(true);
  const latest = React.useRef(0);

  React.useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = React.useCallback(
    async (nextPage: number) => {
      latest.current += 1;
      const request = latest.current;
      setLoading(true);
      setFailed(false);
      const params = new URLSearchParams({ page: String(nextPage), limit: String(PAGE_SIZE), sort });
      if (category) params.set('category', category);
      if (color) params.set('color', color);
      if (designer) params.set('designer', designer);
      if (q) params.set('q', q);
      if (firstLoad.current) params.set('withDesigners', '1');
      try {
        const response = await fetch(`${CATALOG_API}?${params.toString()}`);
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
        setItems((current) => (nextPage === 1 ? data.items : [...current, ...data.items]));
        setTotal(data.total);
        setPage(nextPage);
      } catch {
        if (request === latest.current) {
          setFailed(true);
        }
      } finally {
        if (request === latest.current) {
          setLoading(false);
        }
      }
    },
    [category, color, designer, q, sort]
  );

  React.useEffect(() => {
    if (tab === 'designers') {
      load(1);
    }
  }, [load, tab]);

  const filtered = Boolean(category || color || designer || q);

  return (
    <div className="design-library mt-3 border border-neutral-200 p-2">
      <div className="flex gap-4 border-b border-neutral-200 text-xs">
        {(
          [
            ['designers', 'Designer library'],
            ['basics', 'Shop basics']
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`-mb-px border-b-2 pb-2 ${
              tab === id ? 'border-neutral-900 font-semibold' : 'border-transparent text-neutral-500'
            }`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'basics' && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {CATALOG_DESIGNS.map((design) => (
            <button
              key={design.id}
              type="button"
              className={`border p-1 text-left text-xs ${
                selectedId === design.id ? 'border-neutral-900' : 'border-neutral-200'
              }`}
              onClick={() =>
                onPick({ source: 'catalog', designId: design.id, name: design.name, image: design.image })
              }
            >
              <img src={design.image} alt="" className="aspect-square w-full object-contain" />
              <span className="mt-1 block">{design.name}</span>
            </button>
          ))}
        </div>
      )}

      {tab === 'designers' && (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <input
              type="search"
              value={search}
              placeholder="Search name, tag, code"
              aria-label="Search designs"
              className="col-span-2 border border-neutral-300 px-2 py-1.5 text-xs"
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              aria-label="Category"
              className={selectClass}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">All categories</option>
              {DESIGN_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <select
              aria-label="Colour"
              className={selectClass}
              value={color}
              onChange={(event) => setColor(event.target.value)}
            >
              <option value="">All colours</option>
              {DESIGN_COLORS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <select
              aria-label="Designer"
              className={selectClass}
              value={designer}
              onChange={(event) => setDesigner(event.target.value)}
            >
              <option value="">All designers</option>
              {designers.map((entry) => (
                <option key={entry.slug} value={entry.slug}>
                  {entry.name} ({entry.count})
                </option>
              ))}
            </select>
            <select
              aria-label="Sort"
              className={selectClass}
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="new">Newest</option>
              <option value="best">Best selling</option>
            </select>
          </div>

          {failed && (
            <p className="mt-3 text-xs text-red-700">
              Designs could not be loaded.{' '}
              <button type="button" className="underline" onClick={() => load(1)}>
                Try again
              </button>
            </p>
          )}

          {!failed && !loading && items.length === 0 && (
            <p className="mt-3 text-xs text-neutral-600">
              {filtered
                ? 'No designs match these filters.'
                : 'No designer designs are live yet. Pick one from Shop basics or upload your own.'}
            </p>
          )}

          <div className="mt-3 grid grid-cols-3 gap-2">
            {items.map((design) => (
              <button
                key={design.uuid}
                type="button"
                className={`border p-1 text-left text-xs ${
                  selectedId === design.uuid ? 'border-neutral-900' : 'border-neutral-200'
                }`}
                onClick={() => onPick(designerSelection(design))}
              >
                <img
                  src={design.image}
                  alt=""
                  loading="lazy"
                  className="aspect-square w-full bg-neutral-50 object-cover"
                />
                <span className="mt-1 block truncate">{design.name}</span>
                <span className="block truncate text-neutral-500">by {design.designer.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-neutral-600">
            <span>
              {total > 0 ? `${Math.min(items.length, total)} of ${total}` : ''}
              {loading ? ' Loading…' : ''}
            </span>
            {items.length < total && !loading && (
              <button type="button" className="underline" onClick={() => load(page + 1)}>
                Show more
              </button>
            )}
          </div>
          <div className="mt-2 flex justify-between text-xs">
            <a className="underline" href="/designs">
              Browse all designs
            </a>
            <a className="underline" href="/account/designer">
              Sell your designs
            </a>
          </div>
        </>
      )}
    </div>
  );
}
