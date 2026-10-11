import { useProduct } from '@components/frontStore/catalog/ProductContext.js';
import {
  isFabricSku,
  printPpiForScale,
  printSizeCm,
  qualityForPpi
} from '../../../services/printScale.js';
import {
  getPrintScale,
  subscribePrintScale
} from '../../../services/printScaleView.js';
import React from 'react';
import { useFormContext } from 'react-hook-form';

const toneClass = {
  poor: 'text-red-600',
  acceptable: 'text-amber-600',
  sharp: 'text-emerald-700'
} as const;

/**
 * Keeps the add-to-cart form on the same scale the cloth preview is showing.
 * The slider itself sits on the material.
 */
export default function FabricScale() {
  const { sku } = useProduct();
  const { setValue } = useFormContext();
  const scale = React.useSyncExternalStore(subscribePrintScale, getPrintScale, () => 100);

  React.useEffect(() => {
    if (!isFabricSku(sku)) {
      return;
    }
    setValue('printScale', scale);
  }, [scale, setValue, sku]);

  if (!isFabricSku(sku)) {
    return null;
  }

  const ppi = printPpiForScale(scale);
  const quality = qualityForPpi(ppi);

  return (
    <p className="mt-4 text-sm text-muted-foreground">
      Printing at {scale}% · {printSizeCm(scale).toFixed(1)} cm · Print File Resolution{' '}
      <span className={`font-semibold ${toneClass[quality]}`}>{ppi}</span>
    </p>
  );
}

export const layout = {
  areaId: 'productSinglePageForm',
  sortOrder: 20
};
