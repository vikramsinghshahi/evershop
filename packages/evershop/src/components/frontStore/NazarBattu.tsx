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
  width: 1.4rem;
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

/** Built-in charm: a thread and a blue evil eye with a black center. No image file. */
function NazarBattuMark() {
  return (
    <svg
      className="nazar-battu__mark"
      viewBox="0 0 48 72"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="24"
        y1="0.5"
        x2="24"
        y2="14"
        stroke="#e07068"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="24" cy="14.6" r="1.35" fill="#c4564c" />
      <circle cx="24" cy="36" r="16.5" fill="#1a4fbf" />
      <circle cx="24" cy="36" r="11.2" fill="#3d8ef0" />
      <circle cx="24" cy="36" r="6.6" fill="#f4f8ff" />
      <circle cx="24" cy="36" r="3.4" fill="#111111" />
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
