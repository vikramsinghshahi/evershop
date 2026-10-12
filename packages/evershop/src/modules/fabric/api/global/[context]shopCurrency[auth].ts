import { EvershopRequest } from '../../../../types/request.js';
import { EvershopResponse } from '../../../../types/response.js';
import { applyShopCurrency } from '../../services/applyShopCurrency.js';

/**
 * Cart APIs price the line inside the route handler. This has to run before
 * `auth`, and therefore before every handler, or the handler saves the rupee
 * amount and the checkout screen replaces the quoted total.
 */
export default function shopCurrency(
  request: EvershopRequest,
  response: EvershopResponse,
  next: () => void
) {
  if (request.originalUrl?.startsWith('/api/admin')) {
    next();
    return;
  }
  applyShopCurrency(request, response, next, false);
}
