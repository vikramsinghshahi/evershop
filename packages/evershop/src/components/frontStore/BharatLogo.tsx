import React from 'react';

/**
 * Bharat Textile mark — spool of thread with crossed needles.
 * Traced from the brand lockup. Stroke uses currentColor (the brand green).
 * The spool is filled with the header colour so the needles read as passing behind it.
 */
export function BharatMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <g transform="rotate(-45 12 14)">
          <ellipse cx="12" cy="14" rx="2.4" ry="5.4" />
        </g>
        <path d="M16.5 19.5 30 33" />
        <path d="M50 53 67 70" />
        <g transform="rotate(45 68 14)">
          <ellipse cx="68" cy="14" rx="2.4" ry="5.4" />
        </g>
        <path d="M63.5 19.5 50 33" />
        <path d="M30 53 13 70" />
      </g>
      <g
        fill="var(--header, #e3efe8)"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      >
        <path d="M35 16h10v8H35z" />
        <path d="M29 23h22v6H29z" />
        <path d="M32 29h16v28H32z" />
        <path d="M29 57h22v6H29z" />
      </g>
      <g
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M33.5 34h13" />
        <path d="M33.5 38.5h13" />
        <path d="M33.5 43c4-1.4 8.5 1.4 13-.3" />
        <path d="M33.5 48h13" />
        <path d="M33.5 52.5c4 1.3 8.5-1.6 13 .2" />
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
    <span className={className ?? 'inline-flex items-center gap-2.5 text-current'}>
      <BharatMark className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
      <span className="hidden min-w-0 leading-none sm:block">
        <span className="block text-[12px] font-semibold tracking-[0.16em] uppercase sm:text-[15px] sm:tracking-[0.2em]">
          Bharat Textile
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
