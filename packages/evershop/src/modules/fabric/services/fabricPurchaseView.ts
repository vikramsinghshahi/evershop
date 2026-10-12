/**
 * The cloth preview and the buy box sit in different page areas, so they
 * share whether this visit is plain cloth or a print. Plain is the start.
 * Nothing here is the order snapshot — that is written when the fabric is
 * added to the cart.
 */
export type FabricPurchaseMode = 'plain' | 'print';

let mode: FabricPurchaseMode = 'plain';
const listeners = new Set<() => void>();

function publish(next: FabricPurchaseMode): void {
  if (next === mode) {
    return;
  }
  mode = next;
  listeners.forEach((listener) => listener());
}

export function getFabricPurchaseMode(): FabricPurchaseMode {
  return mode;
}

export function setFabricPurchaseMode(next: FabricPurchaseMode): void {
  publish(next);
}

export function resetFabricPurchaseMode(): void {
  publish('plain');
}

export function subscribeFabricPurchase(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
