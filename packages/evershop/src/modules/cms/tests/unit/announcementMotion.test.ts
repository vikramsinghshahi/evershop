import { describe, expect, it } from '@jest/globals';
import { resolveAnnouncementMotion } from '../../services/announcementMotion.js';

describe('announcement motion', () => {
  it('keeps a chosen fixed, marquee, or slide', () => {
    expect(resolveAnnouncementMotion('fixed', 3)).toBe('fixed');
    expect(resolveAnnouncementMotion('marquee', 1)).toBe('marquee');
    expect(resolveAnnouncementMotion('rotate', 1)).toBe('rotate');
  });

  it('keeps an older bar still when it has one message and sliding when it has several', () => {
    expect(resolveAnnouncementMotion(undefined, 1)).toBe('fixed');
    expect(resolveAnnouncementMotion(null, 0)).toBe('fixed');
    expect(resolveAnnouncementMotion('', 2)).toBe('rotate');
    expect(resolveAnnouncementMotion('scroll', 2)).toBe('rotate');
  });
});
