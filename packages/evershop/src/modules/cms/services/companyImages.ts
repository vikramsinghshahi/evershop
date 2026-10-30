/**
 * Shipped About and Contact photos. These are the small WebP files in
 * `public/company/`. The page widgets store a URL on top of these, so an
 * admin replace uses the file browser and the store's file storage.
 * A blank setting falls back to the path here.
 */
export const COMPANY_IMAGES = {
  aboutHero: '/company/about-hero.webp',
  aboutThen: '/company/about-then.webp',
  aboutNow: '/company/about-now.webp',
  aboutPrint: '/company/about-print.webp',
  aboutSwatch: '/company/about-swatch.webp',
  aboutMaterials: '/company/about-materials.webp',
  contactHero: '/company/contact-hero.webp',
  contactSide: '/company/contact-side.webp'
} as const;

/** A blank or missing widget photo uses the file shipped with the page. */
export function companyPhoto(
  value: string | null | undefined,
  fallback: string
): string {
  if (typeof value !== 'string') return fallback;
  const text = value.trim();
  return text || fallback;
}
