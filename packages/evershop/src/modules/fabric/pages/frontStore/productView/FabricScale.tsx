import { useProduct } from '@components/frontStore/catalog/ProductContext.js';
import { isFabricSku } from '../../../services/printScale.js';
import {
  getFabricPurchaseMode,
  subscribeFabricPurchase
} from '../../../services/fabricPurchaseView.js';
import {
  getPrintScale,
  subscribePrintScale
} from '../../../services/printScaleView.js';
import React from 'react';
import { useFormContext } from 'react-hook-form';

/**
 * Keeps the add-to-cart form on the same scale the cloth preview is showing.
 * The scale, print size, and resolution are shown under Image scale.
 */
export default function FabricScale() {
  const { sku } = useProduct();
  const { setValue } = useFormContext();
  const scale = React.useSyncExternalStore(subscribePrintScale, getPrintScale, () => 100);
  const purchaseMode = React.useSyncExternalStore(
    subscribeFabricPurchase,
    getFabricPurchaseMode,
    () => 'plain' as const
  );

  React.useEffect(() => {
    if (!isFabricSku(sku) || purchaseMode !== 'print') {
      return;
    }
    setValue('printScale', scale);
  }, [purchaseMode, scale, setValue, sku]);

  return null;
}

export const layout = {
  areaId: 'productSinglePageForm',
  sortOrder: 20
};
