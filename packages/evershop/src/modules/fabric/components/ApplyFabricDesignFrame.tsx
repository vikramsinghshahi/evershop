import React from 'react';
import { printSizeCm } from '../services/printScale.js';
import { DesignLayout } from './DesignLayout.js';

/** Same cloth marks as the fabric page's linear meter, the size that page opens on. */
const DOWN_CM = 100;
const ACROSS_CM = 140;

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

/**
 * The chosen design on the apply-fabric card, with the same rulers and
 * scale slider as the fabric preview. The artwork repeats in the tile
 * layout, and the slider sets the size of each repeat. The slider never
 * writes the shared fabric-page scale.
 */
export function ApplyFabricDesignFrame({
  image,
  name,
  scale,
  disabled,
  onScale,
  onReplace
}: {
  image: string;
  name: string;
  scale: number;
  disabled?: boolean;
  onScale: (scale: number) => void;
  onReplace: () => void;
}) {
  const [broken, setBroken] = React.useState(false);
  React.useEffect(() => {
    setBroken(false);
  }, [image]);

  const sizeCm = printSizeCm(scale);

  return (
    <div className="min-w-0">
      <div className="grid w-full grid-cols-[2.75rem_minmax(0,1fr)] border border-border">
        <div className="relative h-9 bg-neutral-50">
          <span className="absolute left-1.5 top-1 text-[11px] leading-none text-neutral-500">cm</span>
        </div>
        <HorizontalRuler spanCm={ACROSS_CM} />
        <VerticalRuler spanCm={DOWN_CM} />
        <button
          type="button"
          className="relative aspect-square min-w-0 cursor-pointer overflow-hidden bg-white text-left"
          aria-label={`Replace ${name}`}
          disabled={disabled}
          onClick={onReplace}
        >
          {!broken && (
            <DesignLayout image={image} layout="tile" rotation={0} scale={scale} />
          )}
          <img src={image} alt="" className="hidden" onError={() => setBroken(true)} />
          {broken && (
            <span className="absolute inset-0 flex items-center justify-center px-3 text-center text-xs text-neutral-500">
              Image unavailable
            </span>
          )}
          <span className="absolute left-3 top-3 bg-white/90 px-2 py-1 text-xs font-semibold tracking-wide">
            IMAGE SCALE {scale}%
          </span>
        </button>
      </div>
      <div className="mt-3 min-w-0">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="text-xs font-semibold tracking-wide">IMAGE SCALE</span>
          <span className="text-sm font-semibold tabular-nums">{scale}%</span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          step={1}
          value={scale}
          disabled={disabled}
          aria-label={`Image scale for ${name}`}
          className="block h-2 w-full max-w-full cursor-pointer accent-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isInteger(next) && next >= 1 && next <= 100) {
              onScale(next);
            }
          }}
        />
        <p className="mt-2 text-sm">
          Print size <span className="font-semibold tabular-nums">{sizeCm.toFixed(1)} cm</span>
        </p>
      </div>
    </div>
  );
}
