import { _ } from '@evershop/evershop/lib/locale/translate/_';
import { MapPin, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface CustomerIconProps {
  customer?: {
    uuid: string;
    fullName: string;
    email: string;
  } | null;
  accountUrl: string;
  loginUrl: string;
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

export default function UserIcon({
  customer,
  accountUrl,
  loginUrl
}: CustomerIconProps) {
  const [greeting, setGreeting] = useState('Hello');
  const [place, setPlace] = useState<string | null>(null);
  const signedIn = Boolean(customer?.uuid);
  const name = signedIn ? firstName(customer?.fullName ?? '') : '';
  const mark = signedIn ? initials(customer?.fullName ?? '') : '';
  const line = name ? `${greeting}, ${name}` : greeting;

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

  return (
    <div className="customer-icon flex items-center">
      <a
        href={signedIn ? accountUrl : loginUrl}
        aria-label={
          place
            ? `${line}, ${place}. ${signedIn ? _('Account') : _('Sign in')}`
            : `${line}. ${signedIn ? _('Account') : _('Sign in')}`
        }
        className="flex items-center gap-2 rounded-md py-1 pl-1 pr-1.5 text-current hover:bg-white/10 sm:pr-2"
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
            <span className="truncate">
              {place ?? _('Locating…')}
            </span>
          </span>
        </span>
      </a>
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
    accountUrl: url(routeId: "account")
    loginUrl: url(routeId: "login")
  }
`;
