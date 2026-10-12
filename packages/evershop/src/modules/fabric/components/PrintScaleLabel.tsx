import {
  layoutLabel,
  type FabricLayoutId
} from '../services/designCatalog.js';
import {
  isPlainFabricLine,
  parseStoredPrintOptions,
  qualityLabel
} from '../services/printScale.js';
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
  if (isPlainFabricLine(value)) {
    return <div className="mt-0.5 text-xs text-neutral-700">Fabric only</div>;
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
      {stored.design && (
        <div className="mt-1 flex items-center gap-2 text-neutral-700">
          <img
            src={stored.design.image}
            alt=""
            className="h-8 w-8 border border-neutral-200 bg-white object-contain"
          />
          <span>
            {stored.design.name} · {layoutLabel(stored.design.layout as FabricLayoutId)} ·{' '}
            {stored.design.rotation}°
          </span>
        </div>
      )}
    </div>
  );
}
