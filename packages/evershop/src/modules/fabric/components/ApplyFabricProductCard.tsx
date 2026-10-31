import { Trash2 } from 'lucide-react';
import React from 'react';
import {
  APPLY_FABRIC_PRODUCTS,
  type ApplyFabricProduct,
  type ApplyFabricProductId,
  applyFabricProductPreview
} from '../services/applyFabricProducts.js';

function ProductPreview({ product }: { product: ApplyFabricProduct }) {
  const [broken, setBroken] = React.useState(false);
  React.useEffect(() => {
    setBroken(false);
  }, [product.id]);

  const src = applyFabricProductPreview(product.image, 640);

  return (
    <div className="mt-3 flex min-h-44 w-full items-center justify-center rounded-lg border border-border bg-background px-4 py-6">
      {src && !broken ? (
        <img
          src={src}
          alt={product.name}
          className="max-h-40 max-w-full object-contain"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="text-sm text-muted-foreground">Image unavailable</span>
      )}
    </div>
  );
}

function ProductChoice({
  product,
  selected,
  disabled,
  onSelect
}: {
  product: ApplyFabricProduct;
  selected: boolean;
  disabled: boolean;
  onSelect: (id: ApplyFabricProductId) => void;
}) {
  const [broken, setBroken] = React.useState(false);
  const src = applyFabricProductPreview(product.image, 160);

  return (
    <button
      type="button"
      title={product.name}
      aria-label={product.name}
      aria-pressed={selected}
      disabled={disabled}
      className={`flex size-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md border bg-white text-[10px] font-medium leading-tight disabled:cursor-not-allowed disabled:opacity-50 ${
        selected ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-foreground/40'
      }`}
      onClick={() => onSelect(product.id)}
    >
      {src && !broken ? (
        <img
          src={src}
          alt=""
          className="size-full object-contain"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="px-1 text-center">{product.name}</span>
      )}
    </button>
  );
}

export function ApplyFabricProductCard({
  selectedId,
  disabled,
  onSelect,
  onClear
}: {
  selectedId: ApplyFabricProductId | null;
  disabled?: boolean;
  onSelect: (id: ApplyFabricProductId) => void;
  onClear: () => void;
}) {
  const selected = APPLY_FABRIC_PRODUCTS.find((item) => item.id === selectedId) ?? null;
  const locked = Boolean(disabled);

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight">Product</h2>
        {selected ? (
          <button
            type="button"
            aria-label="Delete product"
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs font-medium text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            disabled={locked}
            onClick={onClear}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Delete
          </button>
        ) : null}
      </div>
      {selected ? (
        <ProductPreview product={selected} />
      ) : (
        <div className="mt-3 flex min-h-44 w-full items-center justify-center rounded-lg border border-dashed border-border bg-background px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">Choose a bag, dress, or T-shirt.</p>
        </div>
      )}
      {selected ? (
        <p className="mt-2 truncate text-xs text-muted-foreground">{selected.name}</p>
      ) : null}
      <div className="mt-3">
        <p className="mb-2 text-xs text-muted-foreground">Choose a product</p>
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Products">
          {APPLY_FABRIC_PRODUCTS.map((item) => (
            <ProductChoice
              key={item.id}
              product={item}
              selected={selected?.id === item.id}
              disabled={locked}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
