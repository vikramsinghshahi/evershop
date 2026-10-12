import { useProduct } from '@components/frontStore/catalog/ProductContext.js';
import React from 'react';
import { ORDER_SIZES, type OrderSizeId } from '../../../services/orderSize.js';
import {
  getOrderSize,
  setOrderSize,
  subscribeOrderSize
} from '../../../services/orderSizeView.js';
import { isFabricSku } from '../../../services/printScale.js';

/**
 * Cut of cloth, directly above quantity. Linear meter is the start.
 * The preview rulers and the price follow this choice.
 */
export default function FabricOrderSize() {
  const { sku } = useProduct();
  const size = React.useSyncExternalStore(subscribeOrderSize, getOrderSize, () => 'linear' as const);

  if (!isFabricSku(sku)) {
    return null;
  }

  return (
    <div className="fabric-order-size mt-4">
      <div className="text-xs font-semibold tracking-wide">SIZE</div>
      <div className="mt-2 grid grid-cols-3 gap-1.5" role="group" aria-label="Order size">
        {ORDER_SIZES.map((option) => {
          const selected = size === option.id;
          return (
            <button
              key={option.id}
              type="button"
              className={`whitespace-nowrap border px-0.5 py-2 text-center text-[10px] leading-none tracking-tight sm:text-[11px] ${
                selected ? 'border-neutral-900' : 'border-neutral-300'
              }`}
              aria-pressed={selected}
              onClick={() => setOrderSize(option.id as OrderSizeId)}
            >
              {option.label} {option.widthCm}×{option.heightCm}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'productSinglePageForm',
  sortOrder: 25
};
