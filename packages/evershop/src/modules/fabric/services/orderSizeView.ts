import type { OrderSizeId } from './orderSize.js';

/**
 * The cloth preview and the buy box sit in different page areas, so they
 * share the cut the shopper is ordering. Linear meter is the start.
 * Nothing here is the order snapshot.
 */
let size: OrderSizeId = 'linear';
const listeners = new Set<() => void>();

function publish(next: OrderSizeId): void {
  if (next === size) {
    return;
  }
  size = next;
  listeners.forEach((listener) => listener());
}

export function getOrderSize(): OrderSizeId {
  return size;
}

export function setOrderSize(next: OrderSizeId): void {
  publish(next);
}

export function resetOrderSize(): void {
  publish('linear');
}

export function subscribeOrderSize(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
