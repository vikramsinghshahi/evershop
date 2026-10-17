import { Button } from '@components/common/ui/Button.js';
import { toast } from '@components/common/ui/Sonner.js';
import React from 'react';
import { designerApi } from './designerApi.js';
import {
  type DesignDraft,
  DesignFields,
  type DesignOptions,
  draftPayload,
  emptyDraft
} from './DesignFields.js';
import type { OwnDesign } from './DesignList.js';

/** Reads pixel size in the browser. TIFF can't be decoded here; the server checks it. */
function imageSize(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}

export function DesignUpload({
  api,
  options,
  canSubmit,
  onUploaded
}: {
  api: string;
  options: DesignOptions;
  /** False until the agreement is current and the account is not suspended. */
  canSubmit: boolean;
  onUploaded: (design: OwnDesign) => void;
}) {
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [size, setSize] = React.useState<{ width: number; height: number } | null>(null);
  const [draft, setDraft] = React.useState<DesignDraft>(emptyDraft);
  const [submitNow, setSubmitNow] = React.useState(canSubmit);
  const [busy, setBusy] = React.useState(false);
  const input = React.useRef<HTMLInputElement>(null);
  const fileInputId = React.useId();

  React.useEffect(() => () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  }, [preview]);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setSize(null);
    setDraft(emptyDraft());
    if (input.current) {
      input.current.value = '';
    }
  };

  const choose = async (picked: File | undefined) => {
    if (!picked) {
      reset();
      return;
    }
    if (!options.fileTypes.includes(picked.type)) {
      toast.error('Upload a PNG, JPEG, TIFF or WebP image.');
      reset();
      return;
    }
    if (picked.size > options.maxFileMb * 1024 * 1024) {
      toast.error(`The file is larger than ${options.maxFileMb} MB.`);
      reset();
      return;
    }
    const dimensions = picked.type === 'image/tiff' ? null : await imageSize(picked);
    if (dimensions && Math.min(dimensions.width, dimensions.height) < options.minSidePx) {
      toast.error(
        `The image is ${dimensions.width} × ${dimensions.height} px. Each side needs at least ${options.minSidePx} px to print sharply.`
      );
      reset();
      return;
    }
    setFile(picked);
    setSize(dimensions);
    setPreview(picked.type === 'image/tiff' ? null : URL.createObjectURL(picked));
    if (!draft.name) {
      setDraft({
        ...draft,
        name: picked.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').slice(0, 80)
      });
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      toast.error('Choose the design file to upload.');
      return;
    }
    if (!draft.category.trim()) {
      toast.error('Choose a category.');
      return;
    }
    if (draft.colors.length === 0) {
      toast.error('Pick at least one main colour.');
      return;
    }
    const payload = draftPayload(draft);
    const form = new FormData();
    form.append('design', file);
    form.append('name', payload.name);
    form.append('description', payload.description);
    form.append('category', payload.category);
    form.append('colors', JSON.stringify(payload.colors));
    form.append('tags', JSON.stringify(payload.tags));
    form.append('repeatType', payload.repeatType);
    form.append('submit', submitNow && canSubmit ? 'true' : 'false');
    setBusy(true);
    try {
      const result = await designerApi<{ design: OwnDesign; submitError: string | null }>(
        api,
        'POST',
        form
      );
      if (result.submitError) {
        toast.warning(`Saved as a draft. ${result.submitError}`);
      } else if (result.design.status === 'pending') {
        toast.success('Uploaded and sent for review.');
      } else {
        toast.success('Saved as a draft.');
      }
      onUploaded(result.design);
      reset();
    } catch (failure) {
      toast.error((failure as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="design-upload space-y-4" onSubmit={submit}>
      <div className="flex flex-col gap-4 md:flex-row">
        <label
          className="flex h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-border text-center text-sm text-muted-foreground md:w-56"
          htmlFor={fileInputId}
        >
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : file ? (
            <span className="px-3">{file.name}</span>
          ) : (
            <span className="px-3">
              Choose a file
              <br />
              PNG, JPEG, TIFF or WebP, up to {options.maxFileMb} MB
            </span>
          )}
        </label>
        <input
          ref={input}
          id={fileInputId}
          type="file"
          className="sr-only"
          accept={options.fileTypes.join(',')}
          onChange={(event) => choose(event.target.files?.[0])}
        />
        <div className="flex-1 text-xs text-muted-foreground">
          <p>Upload a seamless repeat tile at full print resolution (ideally 150 DPI or more).</p>
          <p className="mt-1">
            Shortest side at least {options.minSidePx} px. We keep your original file private and
            only show shoppers a preview.
          </p>
          {size && (
            <p className="mt-2 text-foreground">
              {size.width} × {size.height} px
            </p>
          )}
        </div>
      </div>
      <DesignFields draft={draft} options={options} idPrefix="upload" onChange={setDraft} />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={submitNow && canSubmit}
          disabled={!canSubmit}
          onChange={(event) => setSubmitNow(event.target.checked)}
        />
        Send for review now
        {!canSubmit && (
          <span className="text-xs text-muted-foreground">
            (accept the current Seller Agreement first)
          </span>
        )}
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={busy || !file} className="cursor-pointer">
          {busy ? 'Saving…' : 'Save design'}
        </Button>
      </div>
    </form>
  );
}
