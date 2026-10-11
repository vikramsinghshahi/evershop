import Area from '@components/common/Area.js';
import { useAppState } from '@components/common/context/app.js';
import { useProductListing } from '@components/frontStore/catalog/ProductListingContext.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';

/**
 * Heading for the all-products listing. The category page takes its title from
 * the category; this page has no entity, so the title is a fixed string — the
 * same one the route's page meta uses.
 */
export function ProductListingInfo() {
  useProductListing();
  const isFabricHome =
    useAppState().config?.pageMeta?.route?.id === 'homepage';
  return (
    <>
      <Area id="productListingInfoBefore" noOuter />
      <div className="product__listing__general mb-8">
        <h1 className="text-3xl font-semibold">
          {isFabricHome ? _('Featured fabrics') : _('All products')}
        </h1>
        {isFabricHome && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {_(
              'Viscose, cotton and rayon, sold by the metre. Open a cloth to choose the print scale and design.'
            )}
          </p>
        )}
      </div>
      <Area id="productListingInfoAfter" noOuter />
    </>
  );
}
