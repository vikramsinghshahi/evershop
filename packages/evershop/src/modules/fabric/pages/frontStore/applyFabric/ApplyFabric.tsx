import { Button } from '@components/common/ui/Button.js';
import { Spinner } from '@components/common/ui/Spinner.js';
import { Download, ImagePlus, Trash2 } from 'lucide-react';
import React from 'react';
import { ApplyFabricDesignFrame } from '../../../components/ApplyFabricDesignFrame.js';
import { ApplyFabricProductCard } from '../../../components/ApplyFabricProductCard.js';
import {
  DEFAULT_APPLY_FABRIC_PRODUCT_ID,
  type ApplyFabricProductId
} from '../../../services/applyFabricProducts.js';

const CATALOG_API = '/api/designer/catalog';
const APPLY_API = '/api/fabric/apply';
const ACCEPT = 'image/png,image/jpeg,image/webp';

function thumb(src: string, width: number): string {
  if (src.startsWith('/')) {
    return `/images?src=${encodeURIComponent(src)}&w=${width}&q=70`;
  }
  return src;
}

interface LibraryDesign {
  uuid: string;
  name: string;
  image: string;
}

interface Picked {
  preview: string;
  name: string;
  file?: File;
  designId?: string;
  objectUrl?: string;
}

function revoke(picked: Picked | null) {
  if (picked?.objectUrl) {
    URL.revokeObjectURL(picked.objectUrl);
  }
}

function saveDataUrl(dataUrl: string, filename: string) {
  const comma = dataUrl.indexOf(',');
  const header = dataUrl.slice(0, comma);
  const encoded = dataUrl.slice(comma + 1);
  const mime = header.match(/data:([^;]+)/)?.[1] || 'image/png';
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function SampleStrip({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3">
      <p className="mb-2 text-xs text-muted-foreground">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">{children}</div>
    </div>
  );
}

function SampleButton({
  name,
  image,
  selected,
  onSelect
}: {
  name: string;
  image: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const [broken, setBroken] = React.useState(false);
  if (broken) {
    return null;
  }
  return (
    <button
      type="button"
      title={name}
      aria-label={name}
      aria-pressed={selected}
      className={`size-16 shrink-0 cursor-pointer overflow-hidden rounded-md border bg-muted ${
        selected ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-foreground/40'
      }`}
      onClick={onSelect}
    >
      <img
        src={thumb(image, 160)}
        alt=""
        className="size-full object-cover"
        onError={() => setBroken(true)}
      />
    </button>
  );
}

function UploadCard({
  title,
  hint,
  picked,
  onFile,
  onClear,
  clearLabel,
  clearDisabled,
  scale,
  onScale,
  samples
}: {
  title: string;
  hint: string;
  picked: Picked | null;
  onFile: (file: File) => void;
  onClear: () => void;
  clearLabel: string;
  clearDisabled?: boolean;
  scale?: number;
  onScale?: (scale: number) => void;
  samples: React.ReactNode;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const openFile = () => {
    if (!clearDisabled) {
      inputRef.current?.click();
    }
  };
  const framed = Boolean(picked && onScale && typeof scale === 'number');
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {picked ? (
          <button
            type="button"
            aria-label={clearLabel}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs font-medium text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            disabled={clearDisabled}
            onClick={onClear}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Delete
          </button>
        ) : null}
      </div>
      {framed && picked && onScale && typeof scale === 'number' ? (
        <div className="mt-3">
          <ApplyFabricDesignFrame
            image={picked.objectUrl ? picked.preview : thumb(picked.preview, 800)}
            name={picked.name}
            scale={scale}
            disabled={clearDisabled}
            onScale={onScale}
            onReplace={openFile}
          />
        </div>
      ) : (
      <button
        type="button"
        aria-label={title}
        className="mt-3 flex min-h-44 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background px-4 py-6 text-center hover:border-foreground/40"
        onClick={openFile}
      >
        {picked ? (
          <img
            src={picked.objectUrl ? picked.preview : thumb(picked.preview, 640)}
            alt=""
            className="max-h-40 max-w-full object-contain"
          />
        ) : (
          <>
            <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ImagePlus className="size-6" aria-hidden="true" />
            </span>
            <span className="mt-3 text-sm font-medium">Click to upload</span>
            <span className="mt-1 text-xs text-muted-foreground">{hint}</span>
          </>
        )}
      </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        aria-label={title}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) {
            onFile(file);
          }
        }}
      />
      {picked ? (
        <p className="mt-2 truncate text-xs text-muted-foreground">{picked.name}</p>
      ) : null}
      {samples}
    </section>
  );
}

export default function ApplyFabric() {
  const [designs, setDesigns] = React.useState<LibraryDesign[]>([]);
  const [designsFailed, setDesignsFailed] = React.useState(false);
  const [design, setDesign] = React.useState<Picked | null>(null);
  const [designScale, setDesignScale] = React.useState(100);
  const [productId, setProductId] = React.useState<ApplyFabricProductId | null>(
    DEFAULT_APPLY_FABRIC_PRODUCT_ID
  );
  const [result, setResult] = React.useState<{ image: string; filename: string } | null>(null);
  const [error, setError] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const designRef = React.useRef<Picked | null>(null);
  designRef.current = design;

  React.useEffect(() => {
    const controller = new AbortController();
    fetch(`${CATALOG_API}?limit=12&sort=new`, { signal: controller.signal })
      .then(async (response) => {
        const json = (await response.json()) as { data?: { items?: LibraryDesign[] } };
        if (!response.ok || !json.data?.items) {
          throw new Error('catalog');
        }
        setDesigns(json.data.items.filter((item) => item.image && item.uuid));
      })
      .catch((failure: unknown) => {
        if (failure instanceof DOMException && failure.name === 'AbortError') {
          return;
        }
        setDesignsFailed(true);
      });
    return () => {
      controller.abort();
      revoke(designRef.current);
    };
  }, []);

  const pickFile = (file: File) => {
    if (busy) {
      return;
    }
    const allowed =
      ACCEPT.split(',').includes(file.type) || /\.(png|jpe?g|webp)$/i.test(file.name);
    if (!allowed) {
      setError('Upload a PNG, JPG, or WebP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('That image is larger than 10 MB.');
      return;
    }
    setError('');
    setResult(null);
    const objectUrl = URL.createObjectURL(file);
    const picked: Picked = {
      preview: objectUrl,
      name: file.name,
      file,
      objectUrl
    };
    revoke(design);
    setDesign(picked);
  };

  const pickDesign = (item: LibraryDesign) => {
    if (busy) {
      return;
    }
    setError('');
    setResult(null);
    revoke(design);
    setDesign({ preview: item.image, name: item.name, designId: item.uuid });
  };

  const pickProduct = (id: ApplyFabricProductId) => {
    if (busy || id === productId) {
      return;
    }
    setError('');
    setResult(null);
    setProductId(id);
  };

  const clearDesign = () => {
    if (busy) {
      return;
    }
    revoke(design);
    setDesign(null);
    setDesignScale(100);
    setResult(null);
    setError('');
  };

  const changeDesignScale = (next: number) => {
    if (busy || next === designScale) {
      return;
    }
    setDesignScale(next);
    setResult(null);
    setError('');
  };

  const clearProduct = () => {
    if (busy) {
      return;
    }
    setProductId(null);
    setResult(null);
    setError('');
  };

  const generate = async () => {
    if (!design || !productId || busy) {
      return;
    }
    setBusy(true);
    setError('');
    try {
      const body = new FormData();
      if (design.file) {
        body.append('fabric', design.file);
      } else if (design.designId) {
        body.append('fabricDesignId', design.designId);
      }
      body.append('productKey', productId);
      body.append('designScale', String(designScale));
      const response = await fetch(APPLY_API, { method: 'POST', body });
      const json = (await response.json()) as {
        data?: { image?: string; filename?: string };
        error?: { message?: string };
      };
      if (!response.ok || !json.data?.image) {
        throw new Error(json.error?.message || 'The design could not be applied.');
      }
      setResult({
        image: json.data.image,
        filename: json.data.filename || 'applied-fabric.png'
      });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'The design could not be applied.');
    } finally {
      setBusy(false);
    }
  };

  const ready = Boolean(design && productId);

  return (
    <div className="apply-fabric py-6">
      <div className="mb-5">
        <h1 className="text-3xl font-semibold tracking-tight">Apply fabric</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Choose a design and a product. The finished image appears on the right, ready to download.
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <UploadCard
            title="Upload design"
            hint="PNG, JPG or WebP"
            picked={design}
            onFile={pickFile}
            onClear={clearDesign}
            clearLabel="Delete design"
            clearDisabled={busy}
            scale={designScale}
            onScale={changeDesignScale}
            samples={
              <SampleStrip label="Use a sample">
                {designs.map((item) => (
                  <SampleButton
                    key={item.uuid}
                    name={item.name}
                    image={item.image}
                    selected={design?.designId === item.uuid}
                    onSelect={() => pickDesign(item)}
                  />
                ))}
                {designs.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {designsFailed
                      ? 'The design library could not be loaded. Upload your own.'
                      : 'Loading designs…'}
                  </p>
                )}
              </SampleStrip>
            }
          />

          <ApplyFabricProductCard
            selectedId={productId}
            disabled={busy}
            onSelect={pickProduct}
            onClear={clearProduct}
          />

          <Button
            type="button"
            size="xl"
            className="w-full cursor-pointer"
            disabled={!ready || busy}
            onClick={generate}
          >
            {busy ? 'Generating…' : 'Generate'}
          </Button>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>

        <section
          className="flex min-h-[32rem] flex-col rounded-lg border border-border bg-card p-4"
          aria-busy={busy}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold tracking-tight">Result</h2>
            {result && !busy ? (
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => saveDataUrl(result.image, result.filename)}
              >
                <Download className="size-4" aria-hidden="true" />
                Download
              </Button>
            ) : null}
          </div>
          <div className="flex flex-1 items-center justify-center rounded-lg bg-background p-4">
            {busy ? (
              <div className="w-full max-w-sm text-center" role="status">
                <Spinner className="mx-auto size-10 text-primary" />
                <p className="mt-4 text-lg font-semibold tracking-tight">Applying the design</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  The result will show up here. This can take a minute.
                </p>
                <div className="relative mt-6 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="absolute inset-y-0 w-1/3 rounded-full bg-primary"
                    style={{ animation: 'apply-fabric-slide 1.2s ease-in-out infinite' }}
                  />
                </div>
                <style>
                  {`@keyframes apply-fabric-slide { 0% { left: -35%; } 100% { left: 100%; } }`}
                </style>
              </div>
            ) : result ? (
              <img
                src={result.image}
                alt="Design applied to the product"
                className="max-h-[40rem] w-full object-contain"
              />
            ) : (
              <div className="max-w-sm text-center">
                <p className="text-lg font-semibold tracking-tight">Apply fabric</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Apply a design to a product. The result shows up here.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};
