import Area from '@components/common/Area.js';
import { useProductListing } from '@components/frontStore/catalog/ProductListingContext.js';
import React from 'react';

/**
 * Slot above a product or fabric listing. The category name already titles a
 * category page, and the fixed "Featured fabrics" / "All products" heading
 * repeated that, so this renders no title of its own.
 */
export function ProductListingInfo() {
  useProductListing();
  return (
    <>
      <Area id="productListingInfoBefore" noOuter />
      <Area id="productListingInfoAfter" noOuter />
    </>
  );
}
