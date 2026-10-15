import React from 'react';
import { fieldClass } from '../../../components/designerApi.js';
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
  const filtered = Boolean(
    filters.category || filters.color || filters.designer || filters.q || filters.sort
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
        <a className="text-sm underline" href={`${sellUrl}?as=designer`}>
          Are you a designer? Sell your designs
        </a>
      </div>

      <form method="get" className="mb-6 grid gap-3 md:grid-cols-6">
        <input
          name="q"
          className={`${fieldClass} md:col-span-2`}
          placeholder="Search designs, designers or SKU"
          defaultValue={filters.q ?? ''}
        />
        <select name="category" className={fieldClass} defaultValue={filters.category ?? ''}>
          <option value="">All categories</option>
          {designFilterOptions.categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select name="color" className={fieldClass} defaultValue={filters.color ?? ''}>
          <option value="">All colours</option>
          {designFilterOptions.colors.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
        <select name="designer" className={fieldClass} defaultValue={filters.designer ?? ''}>
          <option value="">All designers</option>
          {designFilterOptions.designers.map((designer) => (
            <option key={designer.slug} value={designer.slug}>
              {designer.name} ({designer.count})
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <select name="sort" className={fieldClass} defaultValue={filters.sort ?? ''}>
            <option value="">Newest</option>
            <option value="best">Best selling</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-primary px-3 text-sm text-primary-foreground"
          >
            Apply
          </button>
        </div>
      </form>

      {designGallery.items.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          {filtered ? (
            <>
              No designs match these filters.{' '}
              <a className="underline" href="?">
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
