import Area from '@components/common/Area.js';
import { ProductList } from '@components/frontStore/catalog/ProductList.js';
import { useProductListing } from '@components/frontStore/catalog/ProductListingContext.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';

export function ProductListingProducts({
  gridColumns = 3,
  className
}: {
  /** Cards across the row on a wide screen. The all-products page stays at 3. */
  gridColumns?: number;
  className?: string;
}) {
  const { products } = useProductListing();
  return (
    <>
      <Area
        id="productListingProductsBefore"
        className="product__listing__products__before"
      />
      <div>
        <ProductList
          products={products.items}
          layout="grid"
          gridColumns={gridColumns}
          className={className}
        />
        <span className="product-count mt-5 block text-sm text-muted-foreground">
          {_('${count} products', { count: products.total.toString() })}
        </span>
      </div>
      <Area
        id="productListingProductsAfter"
        className="product__listing__products__after"
      />
    </>
  );
}
