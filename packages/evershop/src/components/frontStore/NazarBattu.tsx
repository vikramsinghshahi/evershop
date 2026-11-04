import { sanitizeNazarBattuSvg } from '../../modules/setting/services/nazarBattuSvg.js';
import React, { useState } from 'react';

const CSS = `
.nazar-battu {
  position: absolute;
  top: calc(100% - 0.7rem);
  left: 0;
  z-index: 5;
  display: flex;
  width: 3rem;
  justify-content: center;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  line-height: 0;
  cursor: pointer;
}
@media (min-width: 640px) {
  .nazar-battu { width: 3.5rem; }
}
.nazar-battu:focus-visible {
  outline: 1px solid #c4a574;
  outline-offset: 2px;
}
.nazar-battu__swing {
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-origin: 50% 0;
}
.nazar-battu__swing.is-bouncing {
  animation: nazar-battu-bounce 700ms ease-out;
}
.nazar-battu__mark,
.nazar-battu__custom svg {
  display: block;
  width: 2.4rem;
  height: auto;
}
.nazar-battu__thread {
  display: block;
  width: 2px;
  height: 0.7rem;
}
@keyframes nazar-battu-bounce {
  0% { transform: rotate(0deg); }
  18% { transform: rotate(16deg); }
  36% { transform: rotate(-13deg); }
  54% { transform: rotate(8deg); }
  72% { transform: rotate(-3deg); }
  100% { transform: rotate(0deg); }
}
@media (prefers-reduced-motion: reduce) {
  .nazar-battu__swing.is-bouncing { animation: none; }
}
`;

/** Built-in charm: a thread, a dark face, and a tongue. No image file. */
function NazarBattuMark() {
  return (
    <svg
      className="nazar-battu__mark"
      viewBox="0 0 48 78"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="24"
        y1="0.5"
        x2="24"
        y2="15"
        stroke="#e07068"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="24" cy="15.6" r="1.35" fill="#c4564c" />
      <path
        fill="#1c1614"
        d="M19.2 20.6c.6-3.8 2.5-5.8 4.8-6.4 2.3.6 4.2 2.6 4.8 6.4-1.4-1.1-3-1.6-4.8-1.6s-3.4.5-4.8 1.6z"
      />
      <path
        fill="#1c1614"
        stroke="#c4a574"
        strokeWidth="1.15"
        d="M24 20.2c-9 .2-14.6 7-14.6 15.8 0 8.4 6 14.8 14.6 16.2 8.6-1.4 14.6-7.8 14.6-16.2 0-8.8-5.6-15.6-14.6-15.8z"
      />
      <path
        d="M12.2 27.2c2.3-1.7 5.8-1.5 8 .4"
        stroke="#e7d3ae"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M27.6 27.6c2.1-1.7 5.2-1.4 7.3.5"
        stroke="#e7d3ae"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <ellipse cx="17.4" cy="34" rx="5.3" ry="5.8" fill="#f7f3ea" />
      <ellipse cx="30.5" cy="34.4" rx="4.9" ry="5.4" fill="#f7f3ea" />
      <circle cx="18" cy="34.6" r="2.4" fill="#161311" />
      <circle cx="30.9" cy="35" r="2.25" fill="#161311" />
      <circle cx="18.9" cy="33.5" r="0.8" fill="#fff" />
      <circle cx="31.7" cy="33.9" r="0.7" fill="#fff" />
      <circle cx="11.4" cy="40" r="0.75" fill="#c4a574" />
      <circle cx="36.4" cy="40.4" r="0.75" fill="#c4a574" />
      <path
        d="M18.6 43.8c1.7 1.9 3.4 2.8 5.4 2.8s3.7-.9 5.4-2.8"
        stroke="#f7f3ea"
        strokeWidth="1.05"
        strokeLinecap="round"
      />
      <ellipse cx="24" cy="49.2" rx="2.2" ry="3.2" fill="#d24b3a" />
    </svg>
  );
}

/**
 * Hangs under the brand mark. A click swings it on its thread.
 * An empty `svg` uses the built-in mark. A replacement must already be a
 * sanitized graphic; anything else falls back to the built-in mark.
 */
export function NazarBattu({ svg }: { svg?: string | null }) {
  const [bouncing, setBouncing] = useState(false);
  const custom = sanitizeNazarBattuSvg(svg ?? '');

  const swing = () => {
    setBouncing(false);
    requestAnimationFrame(() => setBouncing(true));
  };

  return (
    <>
      <style>{CSS}</style>
      <button
        type="button"
        className="nazar-battu"
        aria-label="Nazar battu"
        onClick={swing}
      >
        <span
          className={
            bouncing ? 'nazar-battu__swing is-bouncing' : 'nazar-battu__swing'
          }
          onAnimationEnd={() => setBouncing(false)}
        >
          {custom ? (
            <>
              <svg
                className="nazar-battu__thread"
                viewBox="0 0 2 12"
                aria-hidden="true"
              >
                <line
                  x1="1"
                  y1="0"
                  x2="1"
                  y2="12"
                  stroke="#e07068"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                />
              </svg>
              <span
                className="nazar-battu__custom"
                dangerouslySetInnerHTML={{ __html: custom }}
              />
            </>
          ) : (
            <NazarBattuMark />
          )}
        </span>
      </button>
    </>
  );
}
