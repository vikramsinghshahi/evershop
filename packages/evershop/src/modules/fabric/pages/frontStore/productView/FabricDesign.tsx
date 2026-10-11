import { toast } from '@components/common/ui/Sonner.js';
import { useProduct } from '@components/frontStore/catalog/ProductContext.js';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  CATALOG_DESIGNS,
  FABRIC_LAYOUTS,
  layoutLabel
} from '../../../services/designCatalog.js';
import { isFabricSku } from '../../../services/printScale.js';
import {
  getPrintDesignView,
  rotatePrintDesign,
  setPrintDesignSelection,
  setPrintLayout,
  subscribePrintDesign
} from '../../../services/printDesignView.js';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

/**
 * Upload or choose a design, then pick how it repeats. The cloth preview
 * reads the same store. The form value is what add-to-cart posts.
 */
export default function FabricDesign() {
  const { sku } = useProduct();
  const { setValue } = useFormContext();
  const view = React.useSyncExternalStore(subscribePrintDesign, getPrintDesignView, getPrintDesignView);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [catalogOpen, setCatalogOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    if (!isFabricSku(sku)) {
      return;
    }
    const { selection, layout, rotation } = view;
    if (!selection) {
      setValue('printDesign', null);
      return;
    }
    setValue('printDesign', {
      source: selection.source,
      designId: selection.designId,
      name: selection.name,
      ...(selection.source === 'upload' ? { image: selection.image } : {}),
      layout,
      rotation
    });
  }, [setValue, sku, view]);

  if (!isFabricSku(sku)) {
    return null;
  }

  const upload = async (file: File) => {
    if (!IMAGE_TYPES.includes(file.type)) {
      toast.error('Upload a PNG, JPEG, WebP, or GIF image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('That image is larger than 10 MB.');
      return;
    }
    const body = new FormData();
    body.append('design', file);
    setUploading(true);
    try {
      const response = await fetch('/api/fabric/designs', { method: 'POST', body });
      const json = (await response.json()) as {
        data?: { url?: string; name?: string };
        error?: { message?: string };
      };
      if (!response.ok || !json.data?.url) {
        toast.error(json.error?.message || 'The design could not be uploaded.');
        return;
      }
      setPrintDesignSelection({
        source: 'upload',
        designId: 'upload',
        name: json.data.name || file.name,
        image: json.data.url
      });
      setCatalogOpen(false);
    } catch {
      toast.error('The design could not be uploaded.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fabric-design mt-4">
      <div className="text-xs font-semibold tracking-wide">DESIGN</div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="border border-neutral-300 px-3 py-2 text-sm hover:border-neutral-900"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? 'Uploading…' : 'Upload design'}
        </button>
        <button
          type="button"
          className="border border-neutral-300 px-3 py-2 text-sm hover:border-neutral-900"
          onClick={() => setCatalogOpen((open) => !open)}
        >
          Choose design
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={IMAGE_TYPES.join(',')}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) {
              upload(file).catch(() => {
                toast.error('The design could not be uploaded.');
              });
            }
          }}
        />
      </div>
      {catalogOpen && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {CATALOG_DESIGNS.map((design) => {
            const selected = view.selection?.designId === design.id;
            return (
              <button
                key={design.id}
                type="button"
                className={`border p-1 text-left text-xs ${selected ? 'border-neutral-900' : 'border-neutral-200'}`}
                onClick={() => {
                  setPrintDesignSelection({
                    source: 'catalog',
                    designId: design.id,
                    name: design.name,
                    image: design.image
                  });
                  setCatalogOpen(false);
                }}
              >
                <img src={design.image} alt="" className="aspect-square w-full object-contain" />
                <span className="mt-1 block">{design.name}</span>
              </button>
            );
          })}
        </div>
      )}
      <p className="mt-2 text-sm text-neutral-600">
        {view.selection
          ? view.selection.name
          : 'Upload a design or choose one from the catalog.'}
      </p>
      <div className="mt-3 text-xs font-semibold tracking-wide">LAYOUT</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {FABRIC_LAYOUTS.map((layout) => (
          <button
            key={layout.id}
            type="button"
            className={`border px-3 py-2 text-sm ${
              view.layout === layout.id ? 'border-neutral-900' : 'border-neutral-300'
            }`}
            onClick={() => setPrintLayout(layout.id)}
          >
            {layout.label}
          </button>
        ))}
        <button
          type="button"
          className="border border-neutral-300 px-3 py-2 text-sm"
          onClick={() => rotatePrintDesign()}
        >
          Rotate {view.rotation}°
        </button>
      </div>
      {view.selection && (
        <p className="mt-2 text-sm text-neutral-600">
          {layoutLabel(view.layout)} · {view.rotation}°
        </p>
      )}
    </div>
  );
}

export const layout = {
  areaId: 'productSinglePageForm',
  sortOrder: 15
};
