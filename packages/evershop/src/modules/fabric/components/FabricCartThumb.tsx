import { Image } from '@components/common/Image.js';
import React from 'react';
import { DesignLayout } from './DesignLayout.js';
import { isFabricLayout, isFabricRotation } from '../services/designCatalog.js';
import {
  FABRIC_SWATCHES,
  parseStoredPrintOptions,
  type StoredPrintScale
} from '../services/printScale.js';

type CartDesign = NonNullable<StoredPrintScale['design']> & { scale: number };

/**
 * The print saved on a cart line, or null when the line is plain cloth,
 * a non-fabric product, or a payload this preview cannot draw.
 */
function cartDesign(raw?: string | null): CartDesign | null {
  const stored = parseStoredPrintOptions(raw);
  const design = stored?.design;
  if (!stored || !design) {
    return null;
  }
  if (!isFabricLayout(design.layout) || !isFabricRotation(design.rotation)) {
    return null;
  }
  return { ...design, scale: stored.printScale };
}

/**
 * Cart thumbnail for a fabric that was ordered with a design.
 * The cloth stays in the frame and the saved layout is drawn on top of it,
 * the same way the fabric page previews a print. A line with no design
 * renders `plain` unchanged.
 */
export function FabricCartThumb({
  src,
  alt,
  width,
  height,
  frameClassName,
  options,
  sku,
  plain
}: {
  src?: string;
  alt: string;
  width: number;
  height: number;
  frameClassName: string;
  options?: string | null;
  sku?: string;
  plain: React.ReactElement;
}): React.ReactElement {
  const design = cartDesign(options);
  if (!design) {
    return plain;
  }

  const uploaded = design.source === 'upload';
  const swatch = FABRIC_SWATCHES[sku ?? ''] || '#e7e0d6';

  return (
    <div
      className={`relative overflow-hidden ${frameClassName}`}
      style={{ backgroundColor: uploaded ? '#ffffff' : swatch }}
    >
      {src && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="100px"
          objectFit="cover"
          className={`h-full w-full object-cover ${
            uploaded ? '' : 'opacity-[0.14]'
          }`}
          style={{
            height: '100%',
            width: '100%',
            maxWidth: '100%',
            aspectRatio: 'auto'
          }}
        />
      )}
      <div
        className="pointer-events-none absolute inset-0"
        style={uploaded ? undefined : { mixBlendMode: 'multiply' }}
      >
        <DesignLayout
          image={design.image}
          layout={design.layout}
          rotation={design.rotation}
          scale={design.scale}
        />
      </div>
    </div>
  );
}
