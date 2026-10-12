import { useProduct } from '@components/frontStore/catalog/ProductContext.js';
import React from 'react';
import { isFabricSku } from '../../../services/printScale.js';
import {
  getFabricPurchaseMode,
  setFabricPurchaseMode,
  subscribeFabricPurchase,
  type FabricPurchaseMode
} from '../../../services/fabricPurchaseView.js';

const OPTIONS: { id: FabricPurchaseMode; label: string }[] = [
  { id: 'plain', label: 'Fabric only' },
  { id: 'print', label: 'Print' }
];

/**
 * The buy-box fork. Fabric only is the start. Print reveals the design,
 * layout, and scale that already live on this page.
 */
export default function FabricPurchase() {
  const { sku } = useProduct();
  const mode = React.useSyncExternalStore(
    subscribeFabricPurchase,
    getFabricPurchaseMode,
    () => 'plain' as const
  );

  if (!isFabricSku(sku)) {
    return null;
  }

  return (
    <div className="fabric-purchase mt-4">
      <div className="text-xs font-semibold tracking-wide">BUY</div>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="How to buy this fabric">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`border px-3 py-2 text-sm ${
              mode === option.id ? 'border-neutral-900' : 'border-neutral-300'
            }`}
            aria-pressed={mode === option.id}
            onClick={() => setFabricPurchaseMode(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'productSinglePageForm',
  sortOrder: 12
};
