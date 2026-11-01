import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@components/common/ui/NavigationMenu.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import { cn } from '@evershop/evershop/lib/util/cn';
import { shiftIntoView } from '@evershop/evershop/lib/util/shiftIntoView';
import { ChevronDown, Menu, X } from 'lucide-react';
import React from 'react';

/**
 * Coerce a list setting into an array. Menu settings normally arrive as a
 * real array, but a half-configured widget can persist them as a JSON
 * string (the legacy editor seeds list fields as stringified hidden
 * inputs) — guard so `.map`/`.length` never run on a string.
 */
function toMenuArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

interface BasicMenuLinkFlags {
  newTab?: boolean;
  nofollow?: boolean;
  noReferrer?: boolean;
}

/**
 * Compose anchor `rel`. New-tab links always carry noopener+noreferrer
 * (tab-nabbing protection); nofollow and same-tab noreferrer are independent
 * opt-ins. Undefined when no token applies so we don't emit an empty rel.
 */
function relFor(link: BasicMenuLinkFlags): string | undefined {
  const tokens = [
    link.newTab ? 'noopener' : null,
    link.newTab || link.noReferrer ? 'noreferrer' : null,
    link.nofollow ? 'nofollow' : null
  ].filter(Boolean);
  return tokens.length > 0 ? tokens.join(' ') : undefined;
}

interface BasicMenuProps {
  basicMenuWidget: {
    menus: ({
      id: string;
      name: string;
      url: string;
      type: string;
      uuid: string;
      children: ({
        id: string;
        name: string;
        url: string;
        type: string;
        uuid: string;
      } & BasicMenuLinkFlags)[];
    } & BasicMenuLinkFlags)[];
    isMain: boolean;
    className: string;
  };
}

type BasicMenuNode = BasicMenuProps['basicMenuWidget']['menus'][number];

/** Horizontal links only once the row can hold every item. Below this, the hamburger does. */
const WIDE_NAV_PX = 1280;

/**
 * A plain anchor that applies a link's new-tab / SEO flags. Split into two
 * literal branches so `react/jsx-no-target-blank` can statically verify the
 * new-tab branch carries `noopener noreferrer`.
 */
function MenuAnchor({
  link,
  className,
  children
}: {
  link: BasicMenuLinkFlags & { url: string };
  className?: string;
  children: React.ReactNode;
}) {
  return link.newTab ? (
    <a
      href={link.url}
      target="_blank"
      rel={
        link.nofollow ? 'noopener noreferrer nofollow' : 'noopener noreferrer'
      }
      className={className}
    >
      {children}
    </a>
  ) : (
    <a href={link.url} rel={relFor(link)} className={className}>
      {children}
    </a>
  );
}

/**
 * The mobile list of every root item + its sub-items. Used both inside the
 * hamburger panel (main menus) and rendered inline (non-main menus, e.g. a
 * simple footer link list).
 */
function MobileItemList({
  items,
  isActive,
  onNavigate
}: {
  items: BasicMenuNode[];
  isActive: (url: string) => boolean;
  onNavigate?: () => void;
}) {
  return (
    <ul
      className="flex flex-col"
      onClick={(event) => {
        const target = event.target;
        if (target instanceof Element && target.closest('a')) {
          onNavigate?.();
        }
      }}
    >
      {items.map((item) => (
        <li key={item.id} className="evershop-basic-menu__mobile-group">
          <MenuAnchor
            link={item}
            className={cn(
              'evershop-basic-menu__mobile-link block rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/60',
              isActive(item.url) && 'text-primary'
            )}
          >
            {item.name}
          </MenuAnchor>
          {item.children.length > 0 && (
            <ul className="evershop-basic-menu__mobile-subs mb-1 ml-3 flex flex-col border-l border-divider pl-2">
              {item.children.map((subItem) => (
                <li key={subItem.id}>
                  <MenuAnchor
                    link={subItem}
                    className="evershop-basic-menu__mobile-sub-link block rounded-md px-3 py-1.5 text-sm text-foreground/70 transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    {subItem.name}
                  </MenuAnchor>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function BasicMenu({
  basicMenuWidget: { menus, isMain, className }
}: BasicMenuProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const mobilePanelRef = React.useRef<HTMLDivElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const panelId = React.useId();
  const [currentPath, setCurrentPath] = React.useState('');

  // The panel hangs from the toggle's left edge (`left-0`). That is right for a toggle at the page's
  // left and runs off the right of a phone for any other (a centred logo is the commonest header
  // there is; theme-lab FINDINGS #53). So once it is open, measure where it landed and move it back
  // inside the viewport. The `translate` property, not `transform`: a theme that positions the panel
  // with its own `transform` keeps it, and a panel that already fits is left exactly where it was.
  React.useLayoutEffect(() => {
    const panel = mobilePanelRef.current;
    if (!mobileOpen || !panel) {
      return undefined;
    }
    const fit = () => {
      panel.style.translate = '';
      const { left, right } = panel.getBoundingClientRect();
      const dx = shiftIntoView(left, right, document.documentElement.clientWidth);
      if (dx !== 0) {
        panel.style.translate = `${dx}px 0`;
      }
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [mobileOpen]);

  React.useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const menuItems = toMenuArray<BasicMenuNode>(menus).flatMap((item) => {
    if (!item || typeof item.name !== 'string' || item.name.trim() === '') {
      return [];
    }
    return [
      {
        ...item,
        children: toMenuArray<BasicMenuNode['children'][number]>(item.children).filter(
          (child) => child && typeof child.name === 'string' && child.name.trim() !== ''
        )
      }
    ];
  });

  const closeMobile = React.useCallback(() => {
    setMobileOpen(false);
  }, []);

  React.useEffect(() => {
    if (!mobileOpen) {
      return undefined;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      setMobileOpen(false);
      toggleRef.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      const root = toggleRef.current?.closest('.evershop-basic-menu');
      if (root && event.target instanceof Node && root.contains(event.target)) {
        return;
      }
      setMobileOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= WIDE_NAV_PX) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('resize', onResize);
    };
  }, [mobileOpen]);

  const isActive = (url: string) =>
    url === '/' ? currentPath === '/' : !!url && currentPath.startsWith(url);

  return (
    <div className={`evershop-basic-menu ${className ?? ''}`}>
      {/* Wide screens: one horizontal row. A parent with children opens a
          hover/focus dropdown. The trigger itself is a real link. */}
      <nav
        aria-label={_('Main menu')}
        className="evershop-basic-menu__desktop hidden xl:block"
      >
        <NavigationMenu className="evershop-basic-menu__menu max-w-full">
          <NavigationMenuList className="evershop-basic-menu__items flex-row flex-nowrap items-center gap-1">
            {menuItems.map((item) => (
              <NavigationMenuItem
                key={item.id}
                className="evershop-basic-menu__item"
              >
                {item.children.length > 0 ? (
                  <>
                    {/* Trigger renders as an <a> (Base UI render prop,
                        nativeButton={false}) so it navigates on click and
                        still opens on hover. rel split into literals for
                        jsx-no-target-blank. */}
                    <NavigationMenuTrigger
                      className="evershop-basic-menu__trigger justify-center bg-transparent hover:bg-transparent focus:bg-transparent data-open:bg-transparent data-popup-open:bg-transparent hover:font-semibold hover:text-primary"
                      nativeButton={false}
                      render={
                        item.newTab ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel={
                              item.nofollow
                                ? 'noopener noreferrer nofollow'
                                : 'noopener noreferrer'
                            }
                          >
                            {item.name}
                            <ChevronDown
                              className="relative top-px ml-1 size-3"
                              aria-hidden="true"
                            />
                          </a>
                        ) : (
                          <a href={item.url} rel={relFor(item)}>
                            {item.name}
                            <ChevronDown
                              className="relative top-px ml-1 size-3"
                              aria-hidden="true"
                            />
                          </a>
                        )
                      }
                    />
                    <NavigationMenuContent>
                      <ul className="evershop-basic-menu__subs flex flex-col min-w-50 p-2">
                        {item.children.map((subItem) => (
                          <li
                            key={subItem.id}
                            className="evershop-basic-menu__sub"
                          >
                            <NavigationMenuLink
                              href={subItem.url}
                              target={subItem.newTab ? '_blank' : undefined}
                              rel={relFor(subItem)}
                              className="evershop-basic-menu__sub-link w-full"
                            >
                              {subItem.name}
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    href={item.url}
                    target={item.newTab ? '_blank' : undefined}
                    rel={relFor(item)}
                    className="evershop-basic-menu__link px-4 py-2 hover:text-primary transition-colors data-[active=true]:text-primary data-[active=true]:font-semibold hover:bg-transparent focus:bg-transparent hover:underline"
                    data-active={isActive(item.url)}
                  >
                    {item.name}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </nav>

      {/* Smaller than xl. A main menu stays behind the hamburger and opens
          downward. A non-main menu (a footer link list) stays inline. */}
      <nav
        aria-label={_('Main menu')}
        className="evershop-basic-menu__mobile relative xl:hidden"
      >
        {isMain ? (
          menuItems.length === 0 ? null : (
          <>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-expanded={mobileOpen}
              aria-controls={panelId}
              aria-label={mobileOpen ? _('Close menu') : _('Open menu')}
              className="evershop-basic-menu__toggle inline-flex items-center justify-center rounded-md p-2 text-current transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              {mobileOpen ? (
                <X className="size-6" aria-hidden="true" />
              ) : (
                <Menu className="size-6" aria-hidden="true" />
              )}
            </button>
            {mobileOpen && (
              <div
                id={panelId}
                ref={mobilePanelRef}
                className="evershop-basic-menu__mobile-panel absolute left-0 top-full z-40 mt-2 max-h-[70vh] w-64 max-w-[85vw] overflow-y-auto overscroll-contain rounded-lg border border-divider bg-card p-1.5 shadow-lg"
              >
                <MobileItemList
                  items={menuItems}
                  isActive={isActive}
                  onNavigate={closeMobile}
                />
              </div>
            )}
          </>
          )
        ) : (
          <div className="evershop-basic-menu__mobile-inline py-1">
            <MobileItemList items={menuItems} isActive={isActive} />
          </div>
        )}
      </nav>
    </div>
  );
}

export const query = `
  query Query($settings: JSON) {
    basicMenuWidget(settings: $settings) {
      menus {
        id
        name
        url
        type
        uuid
        newTab
        nofollow
        noReferrer
        children {
          id
          name
          url
          type
          uuid
          newTab
          nofollow
          noReferrer
        }
      }
      isMain
      className
    }
  }
`;

export const variables = `{
  settings: getWidgetSetting()
}`;
