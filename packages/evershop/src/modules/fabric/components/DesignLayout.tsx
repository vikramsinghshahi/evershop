import type { FabricLayoutId, FabricRotation } from '../services/designCatalog.js';
import React from 'react';

interface Tile {
  x: number;
  y: number;
  flipX: boolean;
  flipY: boolean;
}

function patternSpec(layout: FabricLayoutId, tile: number): { width: number; height: number; tiles: Tile[] } {
  if (layout === 'tile') {
    return { width: tile, height: tile, tiles: [{ x: 0, y: 0, flipX: false, flipY: false }] };
  }
  if (layout === 'mirror') {
    return {
      width: tile * 2,
      height: tile * 2,
      tiles: [
        { x: 0, y: 0, flipX: false, flipY: false },
        { x: tile, y: 0, flipX: true, flipY: false },
        { x: 0, y: tile, flipX: false, flipY: true },
        { x: tile, y: tile, flipX: true, flipY: true }
      ]
    };
  }
  if (layout === 'vertical') {
    return {
      width: tile * 2,
      height: tile * 2,
      tiles: [
        { x: 0, y: 0, flipX: false, flipY: false },
        { x: 0, y: tile, flipX: false, flipY: false },
        { x: tile, y: tile / 2, flipX: false, flipY: false },
        { x: tile, y: tile / 2 - tile, flipX: false, flipY: false },
        { x: tile, y: tile / 2 + tile, flipX: false, flipY: false }
      ]
    };
  }
  return {
    width: tile * 2,
    height: tile * 2,
    tiles: [
      { x: 0, y: 0, flipX: false, flipY: false },
      { x: tile, y: 0, flipX: false, flipY: false },
      { x: tile / 2, y: tile, flipX: false, flipY: false },
      { x: tile / 2 + tile, y: tile, flipX: false, flipY: false },
      { x: tile / 2 - tile, y: tile, flipX: false, flipY: false }
    ]
  };
}

function TileImage({
  href,
  x,
  y,
  size,
  rotation,
  flipX,
  flipY
}: Tile & { href: string; size: number; rotation: FabricRotation }) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  return (
    <g
      transform={`translate(${cx} ${cy}) rotate(${rotation}) scale(${flipX ? -1 : 1} ${flipY ? -1 : 1}) translate(${-size / 2} ${-size / 2})`}
    >
      <image href={href} width={size} height={size} preserveAspectRatio="xMidYMid slice" />
    </g>
  );
}

/**
 * Draws the chosen artwork on the cloth. Center is one motif. The other
 * layouts repeat it the way the Tex India fabric generator does.
 */
export function DesignLayout({
  image,
  layout,
  rotation,
  scale
}: {
  image: string;
  layout: FabricLayoutId;
  rotation: FabricRotation;
  scale: number;
}) {
  const host = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  const patternId = React.useId().replace(/:/g, '');

  React.useLayoutEffect(() => {
    const node = host.current;
    if (!node) {
      return undefined;
    }
    const measure = () => setWidth(node.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (layout === 'center') {
    return (
      <div ref={host} className="absolute inset-0" aria-hidden="true">
        <img
          src={image}
          alt=""
          className="absolute left-1/2 top-1/2 max-h-none max-w-none object-contain"
          style={{
            width: `${scale}%`,
            height: `${scale}%`,
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`
          }}
        />
      </div>
    );
  }

  const tile = Math.max(12, (width * scale) / 100);
  const spec = width > 0 ? patternSpec(layout, tile) : null;

  return (
    <div ref={host} className="absolute inset-0" aria-hidden="true">
      {spec && (
        <svg className="h-full w-full">
          <defs>
            <pattern
              id={patternId}
              patternUnits="userSpaceOnUse"
              width={spec.width}
              height={spec.height}
            >
              {spec.tiles.map((tileMark) => (
                <TileImage
                  key={`${tileMark.x}-${tileMark.y}-${tileMark.flipX}-${tileMark.flipY}`}
                  href={image}
                  size={tile}
                  rotation={rotation}
                  {...tileMark}
                />
              ))}
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      )}
    </div>
  );
}
