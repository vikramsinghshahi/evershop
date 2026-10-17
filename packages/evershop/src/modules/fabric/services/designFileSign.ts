import { createHmac, timingSafeEqual } from 'crypto';
import { getCookieSecret } from '../../auth/services/getCookieSecret.js';

/** Proves this shop issued the name. The browser cannot mint a signature for another file. */
export function signStoredName(name: string): string {
  return createHmac('sha256', getCookieSecret()).update(`fabric-design:${name}`).digest('base64url');
}

export function verifyStoredName(name: string, sig: string): boolean {
  const expected = signStoredName(name);
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}
