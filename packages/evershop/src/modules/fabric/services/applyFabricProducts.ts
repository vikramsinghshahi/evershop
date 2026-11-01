/**
 * The only garments Apply Fabric can print on. Each file is a WebP whose
 * long side is 1024 pixels, the size the generator uses. The page sends one
 * of these ids. The server loads the matching file from public/ itself.
 */
export const APPLY_FABRIC_PRODUCTS = [
  { id: 'bag', name: 'Bag', image: '/apply-fabric/bag.webp' },
  { id: 'dress', name: 'Dress', image: '/apply-fabric/dress.webp' },
  { id: 'tshirt', name: 'T-shirt', image: '/apply-fabric/tshirt.webp' },
  { id: 'kids', name: 'Kids', image: '/apply-fabric/kids.webp' }
] as const;

/** Shown when the shopper sends anything other than one of the product ids. */
export const APPLY_FABRIC_PRODUCT_CHOICES = 'Choose a bag, dress, T-shirt, or kids.';

export type ApplyFabricProduct = (typeof APPLY_FABRIC_PRODUCTS)[number];
export type ApplyFabricProductId = ApplyFabricProduct['id'];

export const DEFAULT_APPLY_FABRIC_PRODUCT_ID: ApplyFabricProductId = 'bag';

export function findApplyFabricProduct(raw: unknown): ApplyFabricProduct | null {
  if (typeof raw !== 'string') {
    return null;
  }
  const key = raw.trim().toLowerCase();
  return APPLY_FABRIC_PRODUCTS.find((item) => item.id === key) ?? null;
}

/** Missing means the shopper has not chosen. Anything else is not one of the four. */
export function applyFabricProductMessage(raw: unknown): string {
  if (raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '')) {
    return 'Choose a product.';
  }
  return APPLY_FABRIC_PRODUCT_CHOICES;
}

/**
 * A resized preview of one of the product photos.
 * Returns null for any other path, so the page cannot request an arbitrary image.
 */
export function applyFabricProductPreview(image: string, width: number): string | null {
  const known = APPLY_FABRIC_PRODUCTS.some((item) => item.image === image);
  if (!known || !Number.isInteger(width) || width < 1 || width > 2000) {
    return null;
  }
  const relative = image.replace(/^\//, '');
  return `/images?src=${encodeURIComponent(`public/${relative}`)}&w=${width}&q=70`;
}
