import { useProduct } from '@components/frontStore/catalog/ProductContext.js';
import React from 'react';
import {
  getFabricPurchaseMode,
  subscribeFabricPurchase
} from '../../../modules/fabric/services/fabricPurchaseView.js';
import { formatLike, printFeeAmount } from '../../../modules/fabric/services/printFee.js';
import { isFabricSku } from '../../../modules/fabric/services/printScale.js';
import {
  orderSizeById,
  orderSizeLabel,
  swatchUnitPrice
} from '../../../modules/fabric/services/orderSize.js';
import {
  getOrderSize,
  subscribeOrderSize
} from '../../../modules/fabric/services/orderSizeView.js';
import { saleUnitLabel } from '../../../modules/fabric/services/saleUnit.js';

/**
 * Price row of the product page (special price with the regular price struck
 * through, or the regular price alone). Was inline in `ProductSingleForm`;
 * now a shared component so themes can override it through `@components`
 * and the `productView/ProductPrice` block can move it.
 */
export function ProductSinglePrice() {
  const { price, saleUnit, sku, printFee, priceTestSwatch, priceBigSwatch } = useProduct();
  const purchaseMode = React.useSyncExternalStore(
    subscribeFabricPurchase,
    getFabricPurchaseMode,
    () => 'plain' as const
  );
  const orderSize = React.useSyncExternalStore(
    subscribeOrderSize,
    getOrderSize,
    () => 'linear' as const
  );
  const fabric = isFabricSku(sku);
  const piece = fabric ? orderSizeById(orderSize) : orderSizeById('linear');
  const swatch =
    fabric && orderSize !== 'linear'
      ? swatchUnitPrice(
          orderSize,
          price.regular.value,
          orderSize === 'test' ? priceTestSwatch : priceBigSwatch
        )
      : null;
  const unit = swatch ? '' : saleUnitLabel(saleUnit);
  const printingFee = fabric && purchaseMode === 'print' ? printFeeAmount(printFee) : 0;
  const baseValue = swatch ?? price.regular.value;
  const regularText =
    swatch || printingFee
      ? formatLike(price.regular.text, baseValue + printingFee)
      : price.regular.text;
  const specialText =
    price.special && printingFee && !swatch
      ? formatLike(price.special.text, price.special.value + printingFee)
      : price.special?.text;
  return (
    <div>
      <div className="product__single__price flex items-baseline gap-3">
        {price.special && !swatch && price.special.value < price.regular.value ? (
          <>
            <span className="text-2xl font-semibold">{specialText}</span>
            <span className="text-lg text-muted-foreground line-through">
              {regularText}
            </span>
          </>
        ) : (
          <span className="text-2xl font-semibold">{regularText}</span>
        )}
        {unit && (
          <span className="text-base text-muted-foreground">/ {unit}</span>
        )}
      </div>
      {swatch != null && (
        <p className="mt-1 text-sm text-muted-foreground">{orderSizeLabel(piece.id)}</p>
      )}
      {printingFee > 0 && (
        <p className="mt-1 text-sm text-muted-foreground">
          Includes printing {formatLike(price.regular.text, printingFee)}
          {unit ? ` / ${unit}` : ''}
        </p>
      )}
    </div>
  );
}
