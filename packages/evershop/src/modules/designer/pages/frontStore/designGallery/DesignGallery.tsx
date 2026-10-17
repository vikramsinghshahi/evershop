import { Button } from '@components/common/ui/Button.js';
import { Input } from '@components/common/ui/Input.js';
import React from 'react';
import { DesignerSelect } from '../../../components/DesignerSelect.js';
import {
  type GalleryDesign,
  GalleryGrid,
  GalleryPager,
  type PrintFabric
} from '../../../components/GalleryGrid.js';

interface Gallery {
  items: GalleryDesign[];
  total: number;
  page: number;
  limit: number;
  filters: {
    category: string | null;
    color: string | null;
    designer: string | null;
    q: string | null;
    sort: string | null;
  };
}

interface FilterOptions {
  categories: string[];
  colors: string[];
  designers: { slug: string; name: string; count: number }[];
}

const ALL = '__all__';

export default function DesignGallery({
  designGallery,
  designFilterOptions,
  printFabrics,
  sellUrl
}: {
  designGallery: Gallery;
  designFilterOptions: FilterOptions;
  printFabrics: PrintFabric[];
  sellUrl: string;
}) {
  const { filters } = designGallery;
  const [q, setQ] = React.useState(filters.q ?? '');
  const [category, setCategory] = React.useState(filters.category ?? ALL);
  const [color, setColor] = React.useState(filters.color ?? ALL);
  const [designer, setDesigner] = React.useState(filters.designer ?? ALL);
  const [sort, setSort] = React.useState(filters.sort === 'best' ? 'best' : ALL);

  const filtered = Boolean(
    filters.category || filters.color || filters.designer || filters.q || filters.sort
  );

  const categoryOptions = React.useMemo(
    () => [
      { value: ALL, label: 'All categories' },
      ...designFilterOptions.categories.map((value) => ({ value, label: value }))
    ],
    [designFilterOptions.categories]
  );
  const colorOptions = React.useMemo(
    () => [
      { value: ALL, label: 'All colours' },
      ...designFilterOptions.colors.map((value) => ({ value, label: value }))
    ],
    [designFilterOptions.colors]
  );
  const designerOptions = React.useMemo(
    () => [
      { value: ALL, label: 'All designers' },
      ...designFilterOptions.designers.map((entry) => ({
        value: entry.slug,
        label: `${entry.name} (${entry.count})`
      }))
    ],
    [designFilterOptions.designers]
  );
  const sortOptions = React.useMemo(
    () => [
      { value: ALL, label: 'Newest' },
      { value: 'best', label: 'Best selling' }
    ],
    []
  );

  const apply = React.useCallback(
    (event?: React.FormEvent) => {
      event?.preventDefault();
      const params = new URLSearchParams();
      const query = q.trim();
      if (query) params.set('q', query);
      if (category !== ALL) params.set('category', category);
      if (color !== ALL) params.set('color', color);
      if (designer !== ALL) params.set('designer', designer);
      if (sort !== ALL) params.set('sort', sort);
      const search = params.toString();
      window.location.assign(search ? `?${search}` : '?');
    },
    [q, category, color, designer, sort]
  );

  return (
    <div className="design-gallery py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Designs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Prints by independent designers. Pick one, choose a fabric, and we print it to order.
          </p>
        </div>
        <a className="cursor-pointer text-sm underline" href={`${sellUrl}?as=designer`}>
          Are you a designer? Sell your designs
        </a>
      </div>

      <form
        onSubmit={apply}
        className="mb-6 grid gap-3 md:grid-cols-6 md:items-center"
      >
        <Input
          name="q"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search designs, designers or SKU"
          aria-label="Search designs"
          className="h-9 md:col-span-2"
        />
        <DesignerSelect
          label="Category"
          value={category}
          onChange={setCategory}
          options={categoryOptions}
        />
        <DesignerSelect
          label="Colour"
          value={color}
          onChange={setColor}
          options={colorOptions}
        />
        <DesignerSelect
          label="Designer"
          value={designer}
          onChange={setDesigner}
          options={designerOptions}
        />
        <div className="flex gap-2">
          <DesignerSelect
            label="Sort"
            value={sort}
            onChange={setSort}
            options={sortOptions}
            className="flex-1"
          />
          <Button type="submit" size="sm" className="h-9 shrink-0 cursor-pointer px-4">
            Apply
          </Button>
        </div>
      </form>

      {designGallery.items.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          {filtered ? (
            <>
              No designs match these filters.{' '}
              <a className="cursor-pointer underline" href="?">
                Clear filters
              </a>
            </>
          ) : (
            'No designs yet. Check back soon.'
          )}
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-muted-foreground">
            {designGallery.total} design{designGallery.total === 1 ? '' : 's'}
          </p>
          <GalleryGrid designs={designGallery.items} fabrics={printFabrics} />
          <GalleryPager
            page={designGallery.page}
            total={designGallery.total}
            limit={designGallery.limit}
            filters={filters}
          />
        </>
      )}
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    designGallery(
      category: getContextValue("galleryCategory", null)
      color: getContextValue("galleryColor", null)
      designer: getContextValue("galleryDesigner", null)
      q: getContextValue("galleryQuery", null)
      sort: getContextValue("gallerySort", null)
      page: getContextValue("galleryPage", 1)
    )
    designFilterOptions
    printFabrics
    sellUrl: url(routeId: "register")
  }
`;
