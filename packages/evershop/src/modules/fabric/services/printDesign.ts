import {
  catalogDesignById,
  isFabricLayout,
  isFabricRotation,
  type FabricLayoutId,
  type FabricRotation
} from './designCatalog.js';

export interface StoredDesign {
  source: 'catalog' | 'upload';
  designId: string;
  name: string;
  image: string;
  layout: FabricLayoutId;
  rotation: FabricRotation;
}

export type DesignParse =
  | { ok: true; design: StoredDesign }
  | { ok: false; message: string };

const UPLOAD_IMAGE =
  /^(?:\/[a-z]{2}(?:-[a-z]{2})?)?(\/assets\/fabric-designs\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.(png|jpg|webp|gif))$/i;

function sanitizeName(raw: unknown): string {
  if (typeof raw !== 'string') {
    return 'Uploaded design';
  }
  const name = raw
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return name || 'Uploaded design';
}

export function normalizeUploadedDesignUrl(image: string): string | null {
  if (image.includes('..') || image.includes('\\') || image.includes('\0')) {
    return null;
  }
  const match = image.split('?')[0].match(UPLOAD_IMAGE);
  if (!match) {
    return null;
  }
  return match[1];
}

export type DesignDownload =
  | { kind: 'file'; href: string; fileName: string }
  | { kind: 'svg'; svg: string; fileName: string };

function downloadBaseName(name: string): string {
  const base = name
    .replace(/[\\/:*?"<>|\u0000]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
    .replace(/\.(png|jpe?g|webp|gif|svg)$/i, '')
    .trim();
  return base || 'design';
}

/**
 * The file an admin can save from an order line. Uploads point at the
 * image already stored under media. Catalog artwork is the SVG snapshot
 * embedded in the line, because those designs are not files on disk.
 */
export function designDownload(design: StoredDesign): DesignDownload | null {
  if (design.source === 'upload') {
    const href = normalizeUploadedDesignUrl(design.image);
    if (!href) {
      return null;
    }
    const extension = href.match(/\.(png|jpg|webp|gif)$/i)?.[1].toLowerCase() ?? 'png';
    return {
      kind: 'file',
      href,
      fileName: `${downloadBaseName(design.name)}.${extension}`
    };
  }
  if (!design.image.startsWith('data:image/svg+xml,')) {
    return null;
  }
  let svg: string;
  try {
    svg = decodeURIComponent(design.image.slice('data:image/svg+xml,'.length));
  } catch {
    return null;
  }
  if (!svg.startsWith('<svg')) {
    return null;
  }
  return {
    kind: 'svg',
    svg,
    fileName: `${downloadBaseName(design.name)}.svg`
  };
}

/**
 * Turn the add-to-cart design payload into the snapshot stored on the line.
 * Catalog artwork is copied from the server catalog. Upload artwork must
 * already be a file this shop saved.
 */
export function parseDesignSelection(raw: unknown): DesignParse {
  if (raw === undefined || raw === null) {
    return {
      ok: false,
      message: 'Upload a design or choose one from the catalog before adding this fabric.'
    };
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, message: 'Choose a design before adding this fabric.' };
  }
  const body = raw as Record<string, unknown>;
  if (!isFabricLayout(body.layout)) {
    return {
      ok: false,
      message: 'Choose a layout: Center, Tile, Mirror, Vertical, or Brick.'
    };
  }
  if (!isFabricRotation(body.rotation)) {
    return { ok: false, message: 'Rotation must be 0, 90, 180, or 270 degrees.' };
  }
  if (body.source === 'catalog') {
    if (typeof body.designId !== 'string') {
      return { ok: false, message: 'Choose a design from the catalog.' };
    }
    const found = catalogDesignById(body.designId);
    if (!found) {
      return { ok: false, message: 'That design is not in the catalog.' };
    }
    return {
      ok: true,
      design: {
        source: 'catalog',
        designId: found.id,
        name: found.name,
        image: found.image,
        layout: body.layout,
        rotation: body.rotation
      }
    };
  }
  if (body.source === 'upload') {
    if (typeof body.image !== 'string') {
      return { ok: false, message: 'Upload the design again before adding this fabric.' };
    }
    const image = normalizeUploadedDesignUrl(body.image);
    if (!image) {
      return { ok: false, message: 'Upload the design again before adding this fabric.' };
    }
    return {
      ok: true,
      design: {
        source: 'upload',
        designId: 'upload',
        name: sanitizeName(body.name),
        image,
        layout: body.layout,
        rotation: body.rotation
      }
    };
  }
  return { ok: false, message: 'Upload a design or choose one from the catalog.' };
}
