/**
 * The cloth preview and the buy box sit in different page areas, so they
 * share the live scale here. 100% is the largest print of the artwork.
 */
let scale = 100;
const listeners = new Set<() => void>();

export function getPrintScale(): number {
  return scale;
}

export function setPrintScaleView(next: number): void {
  const value = Math.min(100, Math.max(1, Math.round(next)));
  if (value === scale) {
    return;
  }
  scale = value;
  listeners.forEach((listener) => listener());
}

export function subscribePrintScale(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
