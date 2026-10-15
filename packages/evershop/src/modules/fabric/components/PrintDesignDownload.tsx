import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';
import { designDownload } from '../services/printDesign.js';
import { parseStoredPrintOptions } from '../services/printScale.js';

const linkClass =
  'mt-1 inline-block text-xs font-medium text-primary underline-offset-4 hover:underline';

function saveSvg(svg: string, fileName: string): void {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Admin-only. Renders nothing unless the line has a fabric design, so a
 * normal order item is unchanged.
 */
export function PrintDesignDownload({
  value
}: {
  value?: string | null;
}): React.ReactElement | null {
  const design = parseStoredPrintOptions(value)?.design;
  if (!design) {
    return null;
  }
  const target = designDownload(design);
  if (!target) {
    return null;
  }
  if (target.kind === 'file') {
    return (
      <a href={target.href} download={target.fileName || true} className={linkClass}>
        {_('Download design')}
      </a>
    );
  }
  return (
    <button
      type="button"
      className={`${linkClass} cursor-pointer bg-transparent p-0 text-left`}
      onClick={() => saveSvg(target.svg, target.fileName)}
    >
      {_('Download design')}
    </button>
  );
}
