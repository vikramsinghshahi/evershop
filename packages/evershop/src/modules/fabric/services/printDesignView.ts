import type { FabricLayoutId, FabricRotation } from './designCatalog.js';

/**
 * The cloth preview and the buy box sit in different page areas, so they
 * share the design the shopper is printing. Nothing here is the order
 * snapshot — that is written when the fabric is added to the cart.
 */
export interface PrintDesignSelection {
  source: 'catalog' | 'upload' | 'designer';
  designId: string;
  name: string;
  image: string;
  designerName?: string;
  /** Repeat the designer recommends; picking the design applies it. */
  repeatType?: string;
}

export interface PrintDesignViewState {
  selection: PrintDesignSelection | null;
  layout: FabricLayoutId;
  rotation: FabricRotation;
}

const initial: PrintDesignViewState = {
  selection: null,
  layout: 'center',
  rotation: 0
};

let state = initial;
const listeners = new Set<() => void>();

function publish(next: PrintDesignViewState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

export function getPrintDesignView(): PrintDesignViewState {
  return state;
}

export function resetPrintDesignView(): void {
  if (!state.selection && state.layout === 'center' && state.rotation === 0) {
    return;
  }
  publish(initial);
}

export function setPrintDesignSelection(selection: PrintDesignSelection): void {
  publish({ ...state, selection });
}

/** Drops the artwork. Layout, rotation, and scale stay for the next choice. */
export function clearPrintDesignSelection(): void {
  if (!state.selection) {
    return;
  }
  publish({ ...state, selection: null });
}

export function setPrintLayout(layout: FabricLayoutId): void {
  if (layout === state.layout) {
    return;
  }
  publish({ ...state, layout });
}

export function rotatePrintDesign(): void {
  const rotation = ((state.rotation + 90) % 360) as FabricRotation;
  publish({ ...state, rotation });
}

export function subscribePrintDesign(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
