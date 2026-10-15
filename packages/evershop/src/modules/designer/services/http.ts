import { error as logError } from '../../../lib/log/logger.js';
import {
  INTERNAL_SERVER_ERROR,
  INVALID_PAYLOAD,
  OK,
  UNAUTHORIZED
} from '../../../lib/util/httpStatus.js';
import type { EvershopRequest } from '../../../types/request.js';
import { DesignerError } from './db.js';
import { profileByCustomer, type ProfileRow } from './profiles.js';

export function sendOk(response, data: unknown): void {
  response.status(OK);
  response.json({ data });
}

export function sendError(response, status: number, message: string): void {
  response.status(status);
  response.json({ error: { status, message } });
}

export function sendFailure(response, failure: unknown): void {
  if (failure instanceof DesignerError) {
    sendError(response, failure.status || INVALID_PAYLOAD, failure.message);
    return;
  }
  logError(failure);
  sendError(response, INTERNAL_SERVER_ERROR, 'Something went wrong. Try again.');
}

/** The logged-in shopper, or a 401 already sent. */
export function currentCustomer(request: EvershopRequest, response): { customer_id: number } | null {
  const customer = request.getCurrentCustomer?.() as { customer_id: number } | undefined;
  if (!customer?.customer_id) {
    sendError(response, UNAUTHORIZED, 'Sign in to your account first.');
    return null;
  }
  return customer;
}

/** The logged-in shopper's designer profile, or an error already sent. */
export async function currentDesigner(
  request: EvershopRequest,
  response
): Promise<ProfileRow | null> {
  const customer = currentCustomer(request, response);
  if (!customer) {
    return null;
  }
  const profile = await profileByCustomer(customer.customer_id);
  if (!profile) {
    sendError(response, INVALID_PAYLOAD, 'Set up your designer profile first.');
    return null;
  }
  return profile;
}
