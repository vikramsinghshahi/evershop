 
import { Editable } from '@components/common/page-builder/index.js';
import React, { useEffect, useRef } from 'react';
import {
  resolveAnnouncementMotion,
  type AnnouncementMotion
} from '../services/announcementMotion.js';

/**
 * Announcement bar — a thin row above the nav. The admin chooses whether
 * the line stays still, scrolls as a marquee, or slides one message at a
 * time. A single announcement renders statically; multiple announcements
 * cycle upward at the configured interval when the motion is slide.
 *
 * Why a `useEffect` rather than an inline <script>: widgets in the
 * page-builder preview iframe mount client-side, not via the initial SSR
 * payload. Browsers don't execute <script> elements that React inserts
 * into the DOM, so the inline-script approach silently no-ops there. An
 * effect runs the same rotation logic on mount and works in both the
 * preview and on the live storefront.
 *
 * Respects `prefers-reduced-motion` — cross-fades instead of sliding.
 */

export interface AnnouncementLink {
  url: string;
  label: string;
  newTab: boolean;
}

export interface Announcement {
  id: string;
  content: string;
  link: AnnouncementLink | null;
}

export interface AnnouncementBarProps {
  announcementBarWidget: {
    backgroundColor: string;
    textColor: string;
    delay: number;
    motion: AnnouncementMotion | null;
    announcements: Announcement[];
  };
}

// Default state for every slide: off-screen below (translateY(100%), opacity
// 0). Only `is-active` brings it on-screen. `is-leaving` parks it off-screen
// above so it can transition out without snapping. The SSR-rendered first
// slide carries `is-active`; the others have no class and start hidden.
const ROTATION_STYLES = `
  [data-evershop-announcement] {
    overflow: hidden;
    position: relative;
    height: 40px;
  }
  [data-evershop-announcement-slide] {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 400ms ease, opacity 400ms ease;
    transform: translateY(100%);
    opacity: 0;
  }
  [data-evershop-announcement-slide].is-active {
    transform: translateY(0);
    opacity: 1;
  }
  [data-evershop-announcement-slide].is-leaving {
    transform: translateY(-100%);
    opacity: 0;
  }
  [data-evershop-announcement-slide].is-no-transition {
    transition: none;
  }
  @media (prefers-reduced-motion: reduce) {
    [data-evershop-announcement-slide] {
      transition: opacity 200ms ease;
      transform: none !important;
      opacity: 0;
    }
    [data-evershop-announcement-slide].is-active {
      opacity: 1;
    }
  }
`;

const MARQUEE_STYLES = `
  [data-evershop-announcement="marquee"] {
    overflow: hidden;
  }
  [data-evershop-announcement="marquee"] .evershop-announcement-bar__track {
    display: flex;
    width: max-content;
    animation: evershop-announcement-marquee var(--evershop-announcement-duration, 24s) linear infinite;
  }
  [data-evershop-announcement="marquee"]:hover .evershop-announcement-bar__track,
  [data-evershop-announcement="marquee"]:focus-within .evershop-announcement-bar__track {
    animation-play-state: paused;
  }
  [data-evershop-announcement="marquee"] .evershop-announcement-bar__group {
    display: flex;
    flex: none;
    align-items: center;
    padding: 0.5rem 0;
  }
  @keyframes evershop-announcement-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  @media (prefers-reduced-motion: reduce) {
    [data-evershop-announcement="marquee"] .evershop-announcement-bar__track {
      animation: none;
      width: 100%;
      justify-content: center;
    }
    [data-evershop-announcement="marquee"] .evershop-announcement-bar__group[data-copy="1"] {
      display: none;
    }
    [data-evershop-announcement="marquee"] .evershop-announcement-bar__group {
      width: 100%;
      flex-wrap: wrap;
      justify-content: center;
      padding-inline: 1rem;
    }
  }
`;

function Inner({
  content,
  link,
  originalIndex,
  inline,
  nowrap
}: Announcement & { originalIndex: number; inline?: boolean; nowrap?: boolean }) {
  const fieldPath = `settings.announcements.${originalIndex}.content`;
  const contentClass = inline
    ? `evershop-announcement-bar__content text-sm${nowrap ? ' whitespace-nowrap' : ''}`
    : 'evershop-announcement-bar__content px-4 text-center text-sm';
  if (!link || !link.url) {
    return (
      <Editable as="span" fieldPath={fieldPath} className={contentClass}>
        {content}
      </Editable>
    );
  }
  return (
    <a
      href={link.url}
      target={link.newTab ? '_blank' : undefined}
      rel={link.newTab ? 'noopener noreferrer' : undefined}
      className={
        inline
          ? `evershop-announcement-bar__link text-sm hover:opacity-80${nowrap ? ' whitespace-nowrap' : ''}`
          : 'evershop-announcement-bar__link block w-full px-4 text-center text-sm hover:opacity-80'
      }
    >
      <Editable as="span" fieldPath={fieldPath} className="evershop-announcement-bar__content">
        {content}
      </Editable>
      {link.label && link.label !== content && (
        <span className="evershop-announcement-bar__label ml-1 underline underline-offset-2">{link.label}</span>
      )}
    </a>
  );
}

function MessageRow({
  items,
  copy
}: {
  items: Array<{ a: Announcement; originalIndex: number }>;
  copy?: number;
}) {
  return (
    <div
      className="evershop-announcement-bar__group"
      data-copy={copy}
      aria-hidden={copy ? true : undefined}
    >
      {items.map(({ a, originalIndex }, index) => (
        <span
          key={`${copy ?? 0}-${a.id}`}
          className="inline-flex items-center px-4"
        >
          {index > 0 && (
            <span className="pr-4 opacity-60" aria-hidden="true">
              ·
            </span>
          )}
          <Inner {...a} originalIndex={originalIndex} inline nowrap />
        </span>
      ))}
    </div>
  );
}

export default function AnnouncementBar({
  announcementBarWidget
}: AnnouncementBarProps) {
  const {
    backgroundColor,
    textColor,
    delay,
    motion: motionSetting,
    announcements = []
  } = announcementBarWidget;
  // Track the source index so inline edits hit `settings.announcements.${originalIndex}.content`.
  const visible = (announcements ?? [])
    .map((a, originalIndex) => ({ a, originalIndex }))
    .filter(({ a }) => a && a.content);
  const motion = resolveAnnouncementMotion(motionSetting, visible.length);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Rotation loop. Mirrors the state-machine described at the top of the
  // file: default (off-screen below) → is-active → is-leaving. Re-runs
  // when the number of slides or the delay changes so a settings edit in
  // the page-builder picks up immediately.
  useEffect(() => {
    if (motion !== 'rotate' || visible.length < 2) return;
    const root = rootRef.current;
    if (!root) return;
    const slides = Array.from(
      root.querySelectorAll<HTMLElement>('[data-evershop-announcement-slide]')
    );
    if (slides.length < 2) return;

    const safeDelay = Math.max(1000, delay || 4000);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let i = 0;

    const advance = () => {
      const prev = i;
      i = (i + 1) % slides.length;
      if (prev === i) return;

      if (reduce) {
        slides.forEach((s, idx) => {
          s.classList.remove('is-leaving');
          s.classList.toggle('is-active', idx === i);
        });
        return;
      }

      // Wrap-around: incoming slide may still carry `is-leaving` from a
      // previous rotation (parked above). Teleport back to the default
      // below-position with no transition so it can slide up properly.
      if (slides[i].classList.contains('is-leaving')) {
        slides[i].classList.add('is-no-transition');
        slides[i].classList.remove('is-leaving');
        // Force reflow so the no-transition state actually applies before
        // we re-enable transitions.
        void slides[i].offsetHeight;
        slides[i].classList.remove('is-no-transition');
      }

      slides[prev].classList.remove('is-active');
      slides[prev].classList.add('is-leaving');
      slides[i].classList.add('is-active');
    };

    let timer: ReturnType<typeof setInterval> | null = setInterval(
      advance,
      safeDelay + 400
    );
    const onVisibility = () => {
      if (document.hidden) {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      } else if (!timer) {
        timer = setInterval(advance, safeDelay + 400);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [visible.length, delay, motion]);

  if (visible.length === 0) return null;

  const colors = {
    backgroundColor: backgroundColor || '#000000',
    color: textColor || '#ffffff'
  };
  const marqueeSeconds = Math.min(
    48,
    Math.max(16, visible.reduce((sum, item) => sum + item.a.content.length, 0) / 3)
  );

  return (
    <>
      {motion !== 'fixed' && (
        <style
          dangerouslySetInnerHTML={{
            __html: motion === 'rotate' ? ROTATION_STYLES : MARQUEE_STYLES
          }}
        />
      )}
      <div
        ref={rootRef}
        data-evershop-announcement={motion}
        className="evershop-announcement-bar w-full text-sm"
        style={{
          ...colors,
          ['--evershop-announcement-duration' as string]: `${marqueeSeconds}s`
        }}
        role="region"
        aria-label="Announcement"
      >
        {motion === 'rotate' ? (
          visible.map(({ a, originalIndex }, i) => (
            <div
              key={a.id}
              data-evershop-announcement-slide
              className={`evershop-announcement-bar__item${i === 0 ? ' is-active' : ''}`}
            >
              <Inner {...a} originalIndex={originalIndex} />
            </div>
          ))
        ) : motion === 'marquee' ? (
          <div className="evershop-announcement-bar__track">
            <MessageRow items={visible} />
            <MessageRow items={visible} copy={1} />
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center px-4 py-2 text-center">
            {visible.map(({ a, originalIndex }, index) => (
              <span key={a.id} className="inline-flex items-center">
                {index > 0 && (
                  <span className="px-2 opacity-60" aria-hidden="true">
                    ·
                  </span>
                )}
                <Inner {...a} originalIndex={originalIndex} inline />
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export const query = `
  query Query(
    $backgroundColor: String
    $textColor: String
    $delay: Float
    $motion: String
    $announcements: JSON
  ) {
    announcementBarWidget(
      backgroundColor: $backgroundColor
      textColor: $textColor
      delay: $delay
      motion: $motion
      announcements: $announcements
    ) {
      backgroundColor
      textColor
      delay
      motion
      announcements
    }
  }
`;

export const variables = `{
  backgroundColor: getWidgetSetting("backgroundColor", "#000000"),
  textColor: getWidgetSetting("textColor", "#ffffff"),
  delay: getWidgetSetting("delay", 4000),
  motion: getWidgetSetting("motion", null),
  announcements: getWidgetSetting("announcements", [])
}`;
