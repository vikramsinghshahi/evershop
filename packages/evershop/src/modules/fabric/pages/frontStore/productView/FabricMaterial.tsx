import { useProduct } from '@components/frontStore/catalog/ProductContext.js';
import React from 'react';
import { FABRIC_SWATCHES, isFabricSku } from '../../../services/printScale.js';
import {
  getPrintScale,
  setPrintScaleView,
  subscribePrintScale
} from '../../../services/printScaleView.js';
import {
  getPrintDesignView,
  resetPrintDesignView,
  subscribePrintDesign
} from '../../../services/printDesignView.js';
import {
  getFabricPurchaseMode,
  resetFabricPurchaseMode,
  subscribeFabricPurchase
} from '../../../services/fabricPurchaseView.js';
import {
  getOrderSize,
  resetOrderSize,
  subscribeOrderSize
} from '../../../services/orderSizeView.js';
import { DesignLayout } from '../../../components/DesignLayout.js';
import { orderSizeById } from '../../../services/orderSize.js';

/**
 * Centimetre marks for the cloth being ordered. A short swatch is marked
 * every centimetre. A meter-long piece is marked every 10 centimetres.
 */
function rulerStep(spanCm: number): { minor: number; major: number } {
  if (spanCm <= 25) {
    return { minor: 1, major: 5 };
  }
  if (spanCm <= 80) {
    return { minor: 5, major: 25 };
  }
  return { minor: 10, major: 20 };
}

function centimetreLabel(cm: number): string {
  return Number.isInteger(cm) ? String(cm) : cm.toFixed(1);
}

function centimetreMarks(spanCm: number) {
  const { minor, major } = rulerStep(spanCm);
  const marks: { cm: number; major: boolean }[] = [];
  const steps = Math.round(spanCm / minor);
  for (let step = 0; step <= steps; step += 1) {
    const cm = Math.round(step * minor * 1000) / 1000;
    if (cm > spanCm + 0.001) {
      break;
    }
    marks.push({ cm, major: Math.abs(cm % major) < 0.001 });
  }
  const labels = marks
    .filter((mark) => mark.major && spanCm - mark.cm >= major * 0.45)
    .map((mark) => mark.cm);
  return { marks, labels };
}

function VerticalRuler({ spanCm }: { spanCm: number }) {
  const { marks, labels } = centimetreMarks(spanCm);

  return (
    <div className="relative h-full w-full bg-neutral-50" aria-hidden="true">
      <span className="absolute bottom-0 right-0 top-0 w-px bg-neutral-400" />
      {marks.map(({ cm, major }) => (
        <span
          key={cm}
          className={`absolute right-0 h-px ${major ? 'w-2.5 bg-neutral-500' : 'w-1.5 bg-neutral-400'}`}
          style={{ top: `${(cm / spanCm) * 100}%` }}
        />
      ))}
      <span className="absolute bottom-0 right-0 h-px w-2.5 bg-neutral-500" />
      {labels.map((cm) => (
        <span
          key={`label-${cm}`}
          className="absolute right-3.5 text-[11px] leading-none tabular-nums text-neutral-600"
          style={{
            top: `${(cm / spanCm) * 100}%`,
            transform: cm === 0 ? 'none' : 'translateY(-50%)'
          }}
        >
          {centimetreLabel(cm)}
        </span>
      ))}
      <span className="absolute bottom-0 right-3.5 text-[11px] leading-none tabular-nums text-neutral-600">
        {centimetreLabel(spanCm)}
      </span>
    </div>
  );
}

function HorizontalRuler({ spanCm }: { spanCm: number }) {
  const { marks, labels } = centimetreMarks(spanCm);

  return (
    <div className="relative h-9 min-w-0 bg-neutral-50" aria-hidden="true">
      <span className="absolute bottom-0 left-0 right-0 h-px bg-neutral-400" />
      {marks.map(({ cm, major }) => (
        <span
          key={cm}
          className={`absolute bottom-0 w-px ${major ? 'h-2.5 bg-neutral-500' : 'h-1.5 bg-neutral-400'}`}
          style={{ left: `${(cm / spanCm) * 100}%` }}
        />
      ))}
      <span className="absolute bottom-0 right-0 h-2.5 w-px bg-neutral-500" />
      {labels.map((cm) => (
        <span
          key={`label-${cm}`}
          className="absolute bottom-3.5 text-[11px] leading-none tabular-nums text-neutral-600"
          style={{
            left: `${(cm / spanCm) * 100}%`,
            transform: cm === 0 ? 'none' : 'translateX(-50%)'
          }}
        >
          {centimetreLabel(cm)}
        </span>
      ))}
      <span className="absolute bottom-3.5 right-0 text-[11px] leading-none tabular-nums text-neutral-600">
        {centimetreLabel(spanCm)}
      </span>
    </div>
  );
}

export default function FabricMaterial() {
  const { sku, name, image } = useProduct();
  const scale = React.useSyncExternalStore(subscribePrintScale, getPrintScale, () => 100);
  const designView = React.useSyncExternalStore(
    subscribePrintDesign,
    getPrintDesignView,
    getPrintDesignView
  );
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

  React.useLayoutEffect(() => {
    setPrintScaleView(100);
    resetPrintDesignView();
    resetFabricPurchaseMode();
    resetOrderSize();
  }, [sku]);

  if (!isFabricSku(sku)) {
    return null;
  }

  const swatch = FABRIC_SWATCHES[sku] || '#e7e0d6';
  const piece = orderSizeById(orderSize);
  const printing = purchaseMode === 'print';

  return (
    <div className="fabric-material">
      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] border border-border">
        <div className="relative h-9 bg-neutral-50">
          <span className="absolute left-1.5 top-1 text-[11px] leading-none text-neutral-500">cm</span>
        </div>
        <HorizontalRuler spanCm={piece.heightCm} />
        <VerticalRuler spanCm={piece.widthCm} />
        <div
          className="relative aspect-square min-w-0 overflow-hidden"
          style={{ backgroundColor: swatch }}
          aria-label={`${piece.label}, ${piece.widthCm} centimetres down and ${piece.heightCm} centimetres across`}
        >
          {image?.url && (
            <img
              src={image.url}
              alt={image.alt || name}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                printing && designView.selection ? 'opacity-[0.14]' : 'opacity-100'
              }`}
            />
          )}
          {printing && designView.selection && (
            <div className="absolute inset-0" style={{ mixBlendMode: 'multiply' }}>
              <DesignLayout
                image={designView.selection.image}
                layout={designView.layout}
                rotation={designView.rotation}
                scale={scale}
              />
            </div>
          )}
          {printing && (
            <div className="absolute left-3 top-3 bg-white/90 px-2 py-1 text-xs font-semibold tracking-wide">
              IMAGE SCALE {scale}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'productPageMiddleLeft',
  sortOrder: 0
};
