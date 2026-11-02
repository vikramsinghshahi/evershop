export type AnnouncementMotion = 'fixed' | 'marquee' | 'rotate';

/**
 * `fixed` holds the line still. `marquee` scrolls it. `rotate` is the
 * original one-at-a-time slide. A bar saved before this choice keeps that
 * slide when it has more than one message, and stays still when it has one.
 */
export function resolveAnnouncementMotion(
  raw: unknown,
  count: number
): AnnouncementMotion {
  if (raw === 'fixed' || raw === 'marquee' || raw === 'rotate') return raw;
  return count > 1 ? 'rotate' : 'fixed';
}
