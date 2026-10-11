import { BharatLogo } from '@components/frontStore/BharatLogo.js';
import React from 'react';

interface LogoProps {
  setting?: {
    logo?: string | null;
    logoWidth?: string | null;
    logoHeight?: string | null;
    storeName?: string | null;
  };
}

// Cap so an oversized upload doesn't ship a huge file. The endpoint never
// upscales, so smaller logos are served at their real width.
const MAX_LOGO_WIDTH = 768;

export default function Logo({ setting }: LogoProps) {
  // The logo is an admin setting (Store Setting → Branding); when unset, the
  // Bharat Textile lockup is shown. The image always goes through the `/images`
  // endpoint (width-only, so the aspect ratio is preserved) re-encoded to WebP.
  const logo = setting?.logo;
  // Real intrinsic dimensions, captured on upload: the <img> carries them so the
  // browser knows the true aspect ratio (no distortion, no layout shift), and
  // the endpoint is asked for the native width (capped, never upscaled) so it
  // only ever scales down. Rendered size is capped with CSS — `w-auto` keeps the
  // aspect ratio, `max-h-12` matches the fallback lockup — which a theme that
  // ships its own Logo component or logo CSS can override.
  const imgWidth = Number(setting?.logoWidth) || undefined;
  const imgHeight = Number(setting?.logoHeight) || undefined;
  const requestWidth = imgWidth ? Math.min(imgWidth, MAX_LOGO_WIDTH) : 320;
  const optimizedSrc = logo
    ? `/images?src=${encodeURIComponent(logo)}&w=${requestWidth}&q=85&f=webp`
    : undefined;
  const storeName = setting?.storeName || 'Bharat Textile';
  return (
    <div className="logo flex items-center">
      {optimizedSrc && (
        <a href="/" className="logo-icon" aria-label={`${storeName} – home`}>
          <img
            src={optimizedSrc}
            alt=""
            width={imgWidth}
            height={imgHeight}
            className="max-h-12 w-auto max-w-full"
          />
        </a>
      )}
      {!optimizedSrc && (
        <a href="/" className="logo-icon" aria-label={`${storeName} – home`}>
          <BharatLogo />
        </a>
      )}
    </div>
  );
}

export const layout = {
  areaId: 'headerMiddleLeft',
  sortOrder: 0
};

export const query = `
  query query {
    setting {
      logo
      logoWidth
      logoHeight
      storeName
    }
  }
`;
