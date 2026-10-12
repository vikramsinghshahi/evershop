import { EvershopRequest } from '../../../../../types/request.js';
import { EvershopResponse } from '../../../../../types/response.js';
import { applyShopCurrency } from '../../../services/applyShopCurrency.js';

/**
 * Storefront pages pick up the shopper currency before the page query runs.
 * `?currency=EUR` switches it and reloads the same page.
 */
export default function shopCurrency(
  request: EvershopRequest,
  response: EvershopResponse,
  next: () => void
) {
  applyShopCurrency(request, response, next, true);
}
