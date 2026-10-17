import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@components/common/ui/DropdownMenu.js';
import { toast } from '@components/common/ui/Sonner.js';
import {
  useCustomer,
  useCustomerDispatch
} from '@components/frontStore/customer/CustomerContext.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import { MapPin, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface DesignerNav {
  hasProfile: boolean;
  status: 'pending' | 'verified' | 'suspended' | null;
  label: string;
  studioUrl: string;
  displayName?: string;
}

interface CustomerIconProps {
  customer?: {
    uuid: string;
    fullName: string;
    email: string;
  } | null;
  designerNav?: DesignerNav | null;
  accountUrl: string;
  ordersUrl: string;
  loginUrl: string;
  registerUrl: string;
  studioUrl: string;
}

const PLACE_KEY = 'bharatTextilePlace';
const PLACE_MAX_AGE_MS = 6 * 60 * 60 * 1000;

function greetingForHour(hour: number): string {
  if (hour < 12) return _('Good morning');
  if (hour < 17) return _('Good afternoon');
  return _('Good evening');
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/).filter(Boolean)[0] ?? '';
}

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function readCachedPlace(): string | null {
  try {
    const raw = localStorage.getItem(PLACE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { place?: string; at?: number };
    if (!parsed.place || !parsed.at) return null;
    if (Date.now() - parsed.at > PLACE_MAX_AGE_MS) return null;
    return parsed.place;
  } catch {
    return null;
  }
}

function writeCachedPlace(place: string) {
  try {
    localStorage.setItem(
      PLACE_KEY,
      JSON.stringify({ place, at: Date.now() })
    );
  } catch {
    // Private mode can reject storage; the label still shows for this view.
  }
}

/** Precise position only when the shopper has already allowed it. No prompt. */
async function grantedCoords(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  if (!navigator.geolocation?.getCurrentPosition || !navigator.permissions) {
    return null;
  }
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    if (status.state !== 'granted') return null;
  } catch {
    return null;
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }),
      () => resolve(null),
      { maximumAge: PLACE_MAX_AGE_MS, timeout: 8000 }
    );
  });
}

/** City from coordinates, or from the network address when coordinates are absent. */
async function lookupPlace(
  coords: { latitude: number; longitude: number } | null
): Promise<string | null> {
  const params = new URLSearchParams({ localityLanguage: 'en' });
  if (coords) {
    params.set('latitude', String(coords.latitude));
    params.set('longitude', String(coords.longitude));
  }
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`
  );
  if (!response.ok) return null;
  const data = (await response.json()) as {
    city?: string;
    locality?: string;
    principalSubdivision?: string;
  };
  const place = data.city || data.locality || data.principalSubdivision;
  return typeof place === 'string' && place.trim() ? place.trim() : null;
}

const menuItemClass =
  'cursor-pointer data-highlighted:bg-accent data-highlighted:text-accent-foreground';

function AccountTrigger({
  line,
  place,
  mark,
  open
}: {
  line: string;
  place: string | null;
  mark: string;
  open?: boolean;
}) {
  return (
    <span
      className={`flex min-w-0 items-center gap-2 rounded-md py-1 pl-1 pr-1.5 text-current sm:pr-2 ${
        open ? 'bg-white/10' : 'hover:bg-white/10'
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          mark
            ? 'bg-brand text-primary-foreground'
            : 'border border-white/35 bg-white/10 text-current'
        }`}
        aria-hidden="true"
      >
        {mark || <User className="h-4 w-4" />}
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-xs font-medium">{line}</span>
        <span className="flex items-center gap-1 text-[11px] opacity-65">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{place ?? _('Locating…')}</span>
        </span>
      </span>
    </span>
  );
}

export default function UserIcon({
  customer: pageCustomer,
  designerNav,
  accountUrl,
  ordersUrl,
  loginUrl,
  registerUrl,
  studioUrl
}: CustomerIconProps) {
  const { customer: liveCustomer } = useCustomer();
  const { logout } = useCustomerDispatch();
  const [greeting, setGreeting] = useState('Hello');
  const [place, setPlace] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Prefer live context so logout clears the menu without waiting on a prop refresh.
  const customer = liveCustomer?.uuid ? liveCustomer : pageCustomer;
  const signedIn = Boolean(customer?.uuid);
  const fullName =
    typeof customer?.fullName === 'string' ? customer.fullName : '';
  const email = typeof customer?.email === 'string' ? customer.email : '';
  const name = signedIn ? firstName(fullName) : '';
  const mark = signedIn ? initials(fullName) : '';
  const line = name ? `${greeting}, ${name}` : greeting;

  const studioLabel = designerNav?.label || _('Sell designs');
  const studioHref = designerNav?.studioUrl || studioUrl;
  const sellAsDesignerHref = `${registerUrl}${registerUrl.includes('?') ? '&' : '?'}as=designer`;
  const loginToStudioHref = `${loginUrl}${loginUrl.includes('?') ? '&' : '?'}redirect=${encodeURIComponent(studioUrl)}`;

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
    let cancel = false;
    (async () => {
      const cached = readCachedPlace();
      if (cached && !cancel) setPlace(cached);
      try {
        const coords = await grantedCoords();
        const next = await lookupPlace(coords);
        if (cancel) return;
        if (next) {
          setPlace(next);
          writeCachedPlace(next);
        }
      } catch {
        // Leave the cached city, or the empty location line.
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }
    setLoggingOut(true);
    try {
      await logout();
      window.location.assign('/');
    } catch (error) {
      setLoggingOut(false);
      toast.error((error as Error)?.message || _('Logout failed'));
    }
  };

  const ariaLine = place
    ? `${line}, ${place}. ${signedIn ? _('Account menu') : _('Sign in menu')}`
    : `${line}. ${signedIn ? _('Account menu') : _('Sign in menu')}`;

  return (
    <div className="customer-icon flex min-w-0 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={ariaLine}
          className="cursor-pointer rounded-md outline-none focus-visible:ring-1 focus-visible:ring-white/50"
        >
          <AccountTrigger line={line} place={place} mark={mark} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="z-100 w-auto min-w-52 max-w-[min(18rem,calc(100vw-1.5rem))]"
        >
          {signedIn ? (
            <>
              <DropdownMenuLabel className="truncate font-normal normal-case tracking-normal text-foreground">
                {fullName || email || _('My account')}
              </DropdownMenuLabel>
              {email && fullName ? (
                <div className="truncate px-2 pb-1.5 text-xs text-muted-foreground">
                  {email}
                </div>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={menuItemClass}
                render={<a href={accountUrl} />}
              >
                {_('My account')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={menuItemClass}
                render={<a href={ordersUrl} />}
              >
                {_('Orders')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={menuItemClass}
                render={<a href={studioHref} />}
              >
                <span className="flex min-w-0 flex-col">
                  <span>{studioLabel}</span>
                  {designerNav?.status === 'pending' && (
                    <span className="text-xs text-muted-foreground">
                      {_('Profile under review')}
                    </span>
                  )}
                  {designerNav?.status === 'suspended' && (
                    <span className="text-xs text-destructive">
                      {_('Account suspended')}
                    </span>
                  )}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={loggingOut}
                className="cursor-pointer"
                onClick={(event) => {
                  event.preventDefault();
                  void handleLogout();
                }}
              >
                {loggingOut ? _('Signing out…') : _('Log out')}
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem
                className={menuItemClass}
                render={<a href={loginUrl} />}
              >
                {_('Sign in')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={menuItemClass}
                render={<a href={registerUrl} />}
              >
                {_('Create account')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={menuItemClass}
                render={<a href={sellAsDesignerHref} />}
              >
                {_('Sell designs')}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={menuItemClass}
                render={<a href={loginToStudioHref} />}
              >
                {_('Designer sign in')}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export const layout = {
  areaId: 'headerMiddleRight',
  sortOrder: 30
};

export const query = `
  query Query {
    customer: currentCustomer {
      uuid
      fullName
      email
    }
    designerNav
    accountUrl: url(routeId: "account")
    ordersUrl: url(routeId: "orderList")
    loginUrl: url(routeId: "login")
    registerUrl: url(routeId: "register")
    studioUrl: url(routeId: "designerDashboard")
  }
`;
