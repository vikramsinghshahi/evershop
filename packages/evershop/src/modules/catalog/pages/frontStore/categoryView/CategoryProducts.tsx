import { useCategory } from '@components/frontStore/catalog/CategoryContext.js';
import { CategoryProducts } from '@components/frontStore/catalog/CategoryProducts.js';
import { isFabricsCategoryUrl } from '../../../../fabric/components/FabricSearch.js';
import React from 'react';

/**
 * Category page block: the product list. A page component rather than an inline entry of the
 * `CategoryView` shell so a theme can move it from `layouts.json`. It reads `CategoryProvider`,
 * so it must stay inside the category page shell's Areas; placed elsewhere it throws.
 * The Fabrics category uses the five-card cloth grid. Other categories stay at three.
 */
export default function CategoryProductsBlock(): React.ReactElement {
  const { url } = useCategory();
  const fabrics = isFabricsCategoryUrl(url);
  return (
    <CategoryProducts
      gridColumns={fabrics ? 5 : 3}
      className={fabrics ? 'fabric-product-grid' : undefined}
    />
  );
}

export const layout = {
  areaId: 'categoryRightColumn',
  sortOrder: 20
};
