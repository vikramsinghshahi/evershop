/**
 * Designs a shopper can print, and the ways Tex India repeats a design
 * across the cloth. Catalog artwork is ours (small SVGs). Customer uploads
 * are a different path and are never SVG.
 */

export const FABRIC_LAYOUTS = [
  { id: 'center', label: 'Center' },
  { id: 'tile', label: 'Tile' },
  { id: 'mirror', label: 'Mirror' },
  { id: 'vertical', label: 'Vertical' },
  { id: 'brick', label: 'Brick' }
] as const;

export type FabricLayoutId = (typeof FABRIC_LAYOUTS)[number]['id'];

export const FABRIC_ROTATIONS = [0, 90, 180, 270] as const;

export type FabricRotation = (typeof FABRIC_ROTATIONS)[number];

export interface CatalogDesign {
  id: string;
  name: string;
  image: string;
}

function svg(body: string): string {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">${body}</svg>`
  )}`;
}

export const CATALOG_DESIGNS: CatalogDesign[] = [
  {
    id: 'field-flower',
    name: 'Field Flower',
    image: svg(
      `<g fill="#1c1410" transform="translate(40 40)">
        <circle r="6"/>
        <ellipse cy="-18" rx="8" ry="14"/>
        <ellipse cy="18" rx="8" ry="14"/>
        <ellipse cx="-18" rx="14" ry="8"/>
        <ellipse cx="18" rx="14" ry="8"/>
      </g>`
    )
  },
  {
    id: 'narrow-stripe',
    name: 'Narrow Stripe',
    image: svg(
      `<g fill="#1c1410">
        <rect x="8" width="8" height="80"/>
        <rect x="28" width="4" height="80"/>
        <rect x="44" width="10" height="80"/>
        <rect x="64" width="4" height="80"/>
      </g>`
    )
  },
  {
    id: 'polka-dot',
    name: 'Polka Dot',
    image: svg(
      `<g fill="#1c1410">
        <circle cx="20" cy="20" r="8"/>
        <circle cx="60" cy="20" r="8"/>
        <circle cx="40" cy="40" r="8"/>
        <circle cx="20" cy="60" r="8"/>
        <circle cx="60" cy="60" r="8"/>
      </g>`
    )
  },
  {
    id: 'olive-leaf',
    name: 'Olive Leaf',
    image: svg(
      `<g fill="#1c1410" transform="translate(40 40) rotate(-30)">
        <ellipse rx="10" ry="26"/>
        <ellipse cx="-16" cy="6" rx="7" ry="16" transform="rotate(-40)"/>
        <ellipse cx="16" cy="-6" rx="7" ry="16" transform="rotate(40)"/>
      </g>`
    )
  },
  {
    id: 'diamond-tile',
    name: 'Diamond Tile',
    image: svg(
      `<g fill="none" stroke="#1c1410" stroke-width="4">
        <path d="M40 8 L72 40 L40 72 L8 40 Z"/>
        <path d="M40 24 L56 40 L40 56 L24 40 Z"/>
      </g>`
    )
  },
  {
    id: 'soft-wave',
    name: 'Soft Wave',
    image: svg(
      `<g fill="none" stroke="#1c1410" stroke-width="5" stroke-linecap="round">
        <path d="M4 28 C20 8 28 48 44 28 S68 8 76 28"/>
        <path d="M4 52 C20 32 28 72 44 52 S68 32 76 52"/>
      </g>`
    )
  }
];

export function catalogDesignById(id: string): CatalogDesign | undefined {
  return CATALOG_DESIGNS.find((design) => design.id === id);
}

export function isFabricLayout(value: unknown): value is FabricLayoutId {
  return FABRIC_LAYOUTS.some((layout) => layout.id === value);
}

export function isFabricRotation(value: unknown): value is FabricRotation {
  return FABRIC_ROTATIONS.some((rotation) => rotation === value);
}

export function layoutLabel(id: FabricLayoutId): string {
  return FABRIC_LAYOUTS.find((layout) => layout.id === id)?.label ?? id;
}
