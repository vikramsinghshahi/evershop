/** Calls a designer API and returns `data`, or throws with the server's message. */
export async function designerApi<T = unknown>(
  url: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: unknown
): Promise<T> {
  const init: RequestInit = { method, credentials: 'same-origin' };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new Error('Could not reach the shop. Check your connection and try again.');
  }
  const json = await response.json().catch(() => null);
  if (!response.ok || !json || json.error) {
    if (response.status === 413) {
      throw new Error('That file is too large.');
    }
    throw new Error(json?.error?.message || 'Something went wrong. Try again.');
  }
  return json.data as T;
}

export const fieldClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground';

export const labelClass = 'mb-1 block text-sm font-medium';
