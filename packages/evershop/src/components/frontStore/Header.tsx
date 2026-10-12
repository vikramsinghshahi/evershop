import Area from '@components/common/Area.js';
import React from 'react';
import './Header.scss';

export function Header() {
  return (
    <header className="header sticky top-0 z-30 border-b border-[#c4a574]/55 bg-header text-header-foreground">
      {/* Announcement bar area (Announcement bar widget lands here). */}
      <Area
        id="headerTop"
        className="header__top"
        isGlobal
        editableInPageBuilder
      />
      {/* Re-skin (2026-07-10): reference layout — logo left, nav beside it,
          search / account / cart pushed right, constrained to the page width. */}
      <div className="header__middle page-width flex flex-nowrap items-center gap-x-2 py-2 sm:gap-6 sm:py-3.5">
        <Area
          id="headerMiddleLeft"
          className="header__middle__left flex shrink-0 items-center gap-1 sm:gap-8"
          isGlobal
          editableInPageBuilder
        />
        <Area
          id="headerMiddleCenter"
          className="header__middle__center flex min-w-0 flex-1 items-center"
          isGlobal
          editableInPageBuilder
        />
        <Area
          id="headerMiddleRight"
          className="header__middle__right ml-auto flex min-w-0 items-center justify-end gap-0.5 sm:gap-3"
          isGlobal
          editableInPageBuilder
        />
      </div>
      <Area
        id="headerBottom"
        className="header__bottom"
        isGlobal
        editableInPageBuilder
      />
    </header>
  );
}
