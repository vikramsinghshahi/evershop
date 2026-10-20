import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { NextFunction } from 'express';
import { EvershopRequest } from '../../types/request.js';
import { EvershopResponse } from '../../types/response.js';

/**
 * Liveness paths. Also listed as rate-limit exemptions in
 * `modules/base/services/rateLimit.ts`, so a probe is not counted even if
 * this middleware is mounted later.
 */
const HEALTH_PATHS = new Set(['/health', '/healthz']);

/** Browser tab icon and a second cheap ping target. Served from memory. */
const FAVICON_PATHS = new Set(['/favicon.ico', '/assets/favicon.ico']);
const FAVICON = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'favicon.ico')
);

/**
 * Answer a keep-alive probe or the built-in favicon before session, locale,
 * and route middleware. Those later steps query Postgres and, on a storefront
 * route, render the full page.
 */
export default function healthProbe(
  request: EvershopRequest,
  response: EvershopResponse,
  next: NextFunction
) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    next();
    return;
  }
  if (HEALTH_PATHS.has(request.path)) {
    response
      .status(200)
      .set('Cache-Control', 'no-store')
      .type('text/plain')
      .send('ok');
    return;
  }
  if (FAVICON_PATHS.has(request.path)) {
    response
      .status(200)
      .set('Cache-Control', 'public, max-age=86400')
      .type('image/x-icon')
      .send(FAVICON);
    return;
  }
  next();
}
