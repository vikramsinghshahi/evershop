/**
 * The apply-fabric result stays in this tab while a guest signs in.
 * Customer login leaves the page only when it is given a redirect, which
 * would drop the image. The sign-in modal passes an empty redirect.
 */
export const APPLY_FABRIC_STAY_URL = '';

const RESULT_KEY = 'apply-fabric-result';
const DATA_IMAGE = /^data:image\/[a-z0-9.+-]+;base64,/i;
const SAFE_FILENAME = /^[A-Za-z0-9._-]+$/;

export interface ApplyFabricResult {
  image: string;
  filename: string;
}

let held: ApplyFabricResult | null = null;

export function readApplyFabricResult(
  value: unknown
): ApplyFabricResult | null {
  if (!value || typeof value !== 'object') return null;
  const image = (value as { image?: unknown }).image;
  if (typeof image !== 'string' || image.length < 32 || !DATA_IMAGE.test(image))
    return null;
  const filename = (value as { filename?: unknown }).filename;
  const rawName = typeof filename === 'string' ? filename.trim() : '';
  return {
    image,
    filename: SAFE_FILENAME.test(rawName) ? rawName : 'applied-fabric.png'
  };
}

/** A guest can hold a result, but only a signed-in customer may see or download it. */
export function canShowApplyFabricResult(
  signedIn: boolean,
  result: ApplyFabricResult | null
): boolean {
  return signedIn && readApplyFabricResult(result) !== null;
}

export function holdApplyFabricResult(result: ApplyFabricResult | null): void {
  if (typeof window === 'undefined') return;
  held = result;
  try {
    if (result) {
      sessionStorage.setItem(RESULT_KEY, JSON.stringify(result));
    } else {
      sessionStorage.removeItem(RESULT_KEY);
    }
  } catch {
    // A full-size image can exceed the session limit. The in-memory copy
    // still covers the sign-in modal, which does not leave the page.
    try {
      sessionStorage.removeItem(RESULT_KEY);
    } catch {
      // Private mode can refuse both calls. The in-memory copy remains.
    }
  }
}

export function readHeldApplyFabricResult(): ApplyFabricResult | null {
  if (typeof window === 'undefined') return null;
  return held;
}

export function readStoredApplyFabricResult(): ApplyFabricResult | null {
  if (typeof window === 'undefined') return null;
  if (held) return held;
  try {
    const raw = sessionStorage.getItem(RESULT_KEY);
    if (!raw) return null;
    const parsed = readApplyFabricResult(JSON.parse(raw) as unknown);
    if (parsed) held = parsed;
    return parsed;
  } catch {
    return null;
  }
}
