import { Media } from '@components/frontStore/catalog/Media.js';
import { useProduct } from '@components/frontStore/catalog/ProductContext.js';
import { isFabricSku } from '../../../../fabric/services/printScale.js';
import React from 'react';

/**
 * Product page block: the image gallery. A page component rather than an inline entry of the
 * `ProductView` shell so a theme can move it from `layouts.json`. It reads `ProductProvider`,
 * so it must stay inside the product page shell's Areas; placed elsewhere it throws.
 * Fabric products use the cloth preview in that slot instead of this gallery.
 */
export default function ProductMediaBlock(): React.ReactElement | null {
  const { sku } = useProduct();
  if (isFabricSku(sku)) {
    return null;
  }
  return <Media />;
}

export const layout = {
  areaId: 'productPageMiddleLeft',
  sortOrder: 0
};
