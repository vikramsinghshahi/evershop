import React from 'react';

/**
 * Bharat Textile mark — spool of thread with crossed needles.
 * Traced from the brand lockup. Stroke uses currentColor (the brand green).
 * The spool is filled with the header colour so the needles read as passing behind it.
 */
export function BharatMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 80 80"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="translate(4.2 9.5) scale(0.56) translate(-830 -584)">
        <path
          d="M892,584c6.89,2.48,10.26,11.6,13.41,17.74c3.79,8.92,4.41,20.23,1.15,29.45c-1.99,4.18-4.51,8.07-7.06,11.94c-.38,.58-.76,1.16-1.15,1.76c-1.13,1.62-1.13,1.62-3.35,4.11c-1.32,0-2.64,0-4,0c-1.73-1.94-3.09-3.72-4.5-5.87c-.39-.6-.79-1.2-1.2-1.81c-6.79-10.54-8.74-19.85-7.3-32.32c2.09-9.28,8.3-17.55,14-25Z"
          fill="#ffff"
        />
        <path
          d="M958,619c-1.7,9.13-4.8,16.31-10,24c-.5,.75-1,1.51-1.52,2.29c-5.4,7.1-14.16,10.94-22.48,13.71c-1.63,.15-3.26,.25-4.89,.32c-.93,.04-1.87,.08-2.84,.12c-.97,.04-1.95,.08-2.96,.12c-.99,.05-1.97,.09-2.99,.13c-2.44,.11-4.88,.21-7.32,.31c2.37-13.62,8.44-24.79,19.86-33.07c11.61-7.18,21.83-8.42,35.14-7.93Z"
          fill="#ffff"
        />
        <path
          d="M830,619c15.25-.53,27.02,2.57,39.31,12.06c7.34,6.89,12.14,17.36,14.69,26.94c0,.66,0,1.32,0,2c-2.98-.12-5.96-.24-8.94-.37c-.41-.02-.41-.02-2.52-.1c-11.19-.52-20.5-2.72-28.81-10.71c-2.01-2.21-3.89-4.47-5.73-6.82c-.74-.91-1.48-1.82-2.25-2.75c-3.33-6.18-5.75-13.2-5.75-20.25Z"
          fill="#ffff"
        />
        <path
          d="M894,668c4.29,2.27,7.48,4.83,10,9c.62,4.28,.31,6.4-1.69,10.25c-2.88,3.43-4.92,5.35-9.42,6.1c-4.21,.27-7.03,.01-10.39-2.66c-3.6-3.87-3.95-7.24-3.93-12.33c.74-4.1,3.36-6.69,6.43-9.36c3.11-1.55,5.56-1.29,9-1Z"
          fill="#ffff"
        />
      </g>
    </svg>
  );
}

interface BharatLogoProps {
  className?: string;
}

/** Horizontal lockup: mark, wordmark, and the “standards set in thread” line. */
export function BharatLogo({ className }: BharatLogoProps) {
  return (
    <span
      className={className ?? 'inline-flex items-center gap-2.5 text-current'}
    >
      <BharatMark className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
      <span className="hidden min-w-0 leading-none sm:block">
        <span className="block text-[12px] font-semibold tracking-[0.16em] uppercase sm:text-[15px] sm:tracking-[0.2em]">
          Bharat Textile India
        </span>
        <span
          className="mt-1.5 hidden h-px w-8 bg-[#c4a574] sm:block"
          aria-hidden="true"
        />
        <span className="mt-1.5 hidden text-[9px] font-medium tracking-[0.22em] uppercase sm:block">
          Standards set in thread
        </span>
      </span>
    </span>
  );
}
