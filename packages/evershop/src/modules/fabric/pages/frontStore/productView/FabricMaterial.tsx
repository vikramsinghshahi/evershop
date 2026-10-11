import { useProduct } from '@components/frontStore/catalog/ProductContext.js';
import React from 'react';
import {
  FABRIC_SWATCHES,
  isFabricSku,
  printPpiForScale,
  printSizeCm,
  printSpanCm,
  qualityForPpi
} from '../../../services/printScale.js';
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
import { DesignLayout } from '../../../components/DesignLayout.js';

const toneClass = {
  poor: 'text-red-600',
  acceptable: 'text-amber-600',
  sharp: 'text-emerald-700'
} as const;

/**
 * Shared centimetre marks for both rulers. 0 is the top-left corner of the
 * cloth. The far edge is the artwork at 100% (about 10.6 cm).
 */
function centimetreMarks(spanCm: number) {
  const marks: { cm: number; major: boolean }[] = [];
  const steps = Math.round(spanCm * 2);
  for (let step = 0; step <= steps; step += 1) {
    const cm = step / 2;
    if (cm > spanCm + 0.001) {
      break;
    }
    marks.push({ cm, major: step % 2 === 0 });
  }
  const labels = marks
    .filter((mark) => mark.major && spanCm - mark.cm >= 0.8)
    .map((mark) => mark.cm);
  return { marks, labels };
}

function VerticalRuler({ spanCm }: { spanCm: number }) {
  const { marks, labels } = centimetreMarks(spanCm);

  return (
    <div className="relative h-full w-12 bg-neutral-50" aria-hidden="true">
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
          {cm}
        </span>
      ))}
      <span className="absolute bottom-0 right-3.5 text-[11px] leading-none tabular-nums text-neutral-600">
        {spanCm.toFixed(1)}
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
          {cm}
        </span>
      ))}
      <span className="absolute bottom-3.5 right-0 text-[11px] leading-none tabular-nums text-neutral-600">
        {spanCm.toFixed(1)}
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

  React.useLayoutEffect(() => {
    setPrintScaleView(100);
    resetPrintDesignView();
  }, [sku]);

  if (!isFabricSku(sku)) {
    return null;
  }

  const swatch = FABRIC_SWATCHES[sku] || '#e7e0d6';
  const ppi = printPpiForScale(scale);
  const quality = qualityForPpi(ppi);
  const spanCm = printSpanCm();
  const sizeCm = printSizeCm(scale);

  return (
    <div className="fabric-material">
      <div className="grid grid-cols-[3rem_minmax(0,1fr)] border border-border">
        <div className="relative h-9 bg-neutral-50">
          <span className="absolute left-1.5 top-1 text-[11px] leading-none text-neutral-500">cm</span>
        </div>
        <HorizontalRuler spanCm={spanCm} />
        <VerticalRuler spanCm={spanCm} />
        <div
          className="relative aspect-square min-w-0 overflow-hidden"
          style={{ backgroundColor: swatch }}
          aria-label={`Print preview, ${sizeCm.toFixed(1)} centimetres at ${scale} percent`}
        >
        {image?.url && (
          <img
            src={image.url}
            alt={image.alt || name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {designView.selection && (
          <div className="absolute inset-0" style={{ mixBlendMode: 'multiply' }}>
            <DesignLayout
              image={designView.selection.image}
              layout={designView.layout}
              rotation={designView.rotation}
              scale={scale}
            />
          </div>
        )}
        <div className="absolute left-3 top-3 bg-white/90 px-2 py-1 text-xs font-semibold tracking-wide">
          IMAGE SCALE {scale}%
        </div>
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs font-semibold tracking-wide">IMAGE SCALE</span>
          <span className="text-sm font-semibold tabular-nums">{scale}%</span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          step={1}
          value={scale}
          aria-label={`Image scale for ${name}`}
          className="h-2 w-full cursor-pointer accent-neutral-900"
          onChange={(event) => {
            setPrintScaleView(Number(event.target.value));
          }}
        />
        <div className="mt-2 text-sm">
          Print File Resolution{' '}
          <span className={`font-semibold ${toneClass[quality]}`}>{ppi}</span>
          <span className="text-neutral-500"> · </span>
          Print size <span className="font-semibold tabular-nums">{sizeCm.toFixed(1)} cm</span>
        </div>
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'productPageMiddleLeft',
  sortOrder: 0
};
