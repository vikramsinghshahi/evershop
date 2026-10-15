import {
  layoutLabel,
  type FabricLayoutId
} from '../services/designCatalog.js';
import {
  isPlainFabricLine,
  parseStoredPrintOptions,
  qualityLabel
} from '../services/printScale.js';
import { orderSizeFromOptions, orderSizeLabel } from '../services/orderSize.js';
import React from 'react';

const toneClass = {
  poor: 'text-red-700',
  acceptable: 'text-amber-700',
  sharp: 'text-emerald-700'
} as const;

export function PrintScaleLabel({
  value
}: {
  value?: string | null;
}): React.ReactElement | null {
  const size = orderSizeFromOptions(value);
  const sizeText = size === 'linear' ? '' : orderSizeLabel(size);
  if (isPlainFabricLine(value)) {
    return (
      <div className="mt-0.5 text-xs text-neutral-700">
        Fabric only{sizeText ? ` · ${sizeText}` : ''}
      </div>
    );
  }
  const stored = parseStoredPrintOptions(value);
  if (!stored) {
    return null;
  }
  return (
    <div className="mt-0.5 text-xs">
      <div className={toneClass[stored.quality]}>
        Print scale {stored.printScale}% · {stored.printPpi} PPI ·{' '}
        {qualityLabel(stored.quality)}
      </div>
      {sizeText && <div className="text-neutral-700">{sizeText}</div>}
      {stored.printFee > 0 && (
        <div className="text-neutral-700">Printing fee {stored.printFee.toFixed(2)}</div>
      )}
      {stored.design && (
        <div className="mt-1 flex items-center gap-2 text-neutral-700">
          <img
            src={stored.design.image}
            alt=""
            className="h-8 w-8 border border-neutral-200 bg-white object-contain"
          />
          <span>
            {stored.design.name}
            {stored.design.source === 'designer' && stored.design.designerName
              ? ` by ${stored.design.designerName}`
              : ''}
            {stored.design.designSku ? ` (${stored.design.designSku})` : ''} ·{' '}
            {layoutLabel(stored.design.layout as FabricLayoutId)} · {stored.design.rotation}°
          </span>
        </div>
      )}
    </div>
  );
}
