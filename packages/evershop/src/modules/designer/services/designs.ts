import { createHash, randomUUID } from 'crypto';
import { createReadStream } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { CONSTANTS } from '../../../lib/helpers.js';
import { error as logError } from '../../../lib/log/logger.js';
import { deleteFile } from '../../cms/services/deleteFile.js';
import { openStoredObject, type StoredObject } from '../../cms/services/openStoredObject.js';
import { getFileStorageProvider } from '../../cms/services/storage/storageConfig.js';
import { uniqueStoredImageName } from '../../cms/services/uniqueStoredImageName.js';
import { uploadFile } from '../../cms/services/uploadFile.js';
import { DesignerError, inTransaction, one, rows } from './db.js';
import {
  checkDesignDetails,
  DESIGN_FILE_TYPES,
  DESIGN_MAX_FILE_MB,
  DESIGN_MAX_OPEN,
  DESIGN_MIN_SIDE_PX,
  designerCan,
  designSku,
  designStatusLabel,
  reviewerCan,
  type DesignDetails
} from './designerRules.js';
import { notifyDesigner } from './notify.js';
import { hasCurrentAgreement, type ProfileRow } from './profiles.js';

export interface DesignRow {
  designer_design_id: number;
  uuid: string;
  designer_profile_id: number;
  sku: string | null;
  name: string;
  description: string | null;
  category: string;
  colors: string[];
  tags: string[];
  repeat_type: string;
  image: string;
  original_file: string;
  original_name: string | null;
  file_hash: string;
  width_px: number;
  height_px: number;
  dpi: number | null;
  status: string;
  review_note: string | null;
  sales_count: number;
  submitted_at: Date | null;
  approved_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/** Shopper-facing preview. Served from media, or from the configured bucket. */
const PREVIEW_DIR = 'designer-designs';
/**
 * Local print file. A dot-folder inside media is never served by the static
 * middleware.
 */
const ORIGINAL_DIR = '.designer-originals';
/** Print file in the configured bucket. Visible in the bucket browser. */
const CLOUD_ORIGINAL_DIR = 'designer-originals';
const STORED_FILE_NAME = /^[0-9a-f-]{36}\.(png|jpg|tif|webp)$/i;
const ROOT_FILE_NAME = /^[a-z0-9][a-z0-9.-]{0,160}\.(png|jpg|tif|webp)$/i;
const PREVIEW_MAX_PX = 1600;

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/tiff': 'tif',
  'image/webp': 'webp'
};

const SHARP_FORMATS: Record<string, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  tiff: 'image/tiff',
  webp: 'image/webp'
};

export function originalFilePath(design: Pick<DesignRow, 'original_file'>): string | null {
  if (!STORED_FILE_NAME.test(design.original_file)) {
    return null;
  }
  return path.join(CONSTANTS.MEDIAPATH, ORIGINAL_DIR, design.original_file);
}

const ORIGINAL_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  tif: 'image/tiff',
  webp: 'image/webp'
};

function asUpload(filename: string, buffer: Buffer, mimetype: string): Express.Multer.File {
  return { filename, buffer, mimetype, size: buffer.length } as Express.Multer.File;
}

async function storeDesignFiles(
  id: string,
  extension: string,
  originalBuffer: Buffer,
  previewBuffer: Buffer,
  mimetype: string,
  originalFilename: string
): Promise<{ imageUrl: string; originalName: string; previewName: string }> {
  if (getFileStorageProvider() === 'local') {
    const originalName = `${id}.${extension}`;
    const previewName = `${id}.webp`;
    const originalPath = path.join(CONSTANTS.MEDIAPATH, ORIGINAL_DIR, originalName);
    const previewPath = path.join(CONSTANTS.MEDIAPATH, PREVIEW_DIR, previewName);
    await fs.mkdir(path.dirname(originalPath), { recursive: true });
    await fs.mkdir(path.dirname(previewPath), { recursive: true });
    await fs.writeFile(originalPath, originalBuffer);
    await fs.writeFile(previewPath, previewBuffer);
    return { imageUrl: `/assets/${PREVIEW_DIR}/${previewName}`, originalName, previewName };
  }
  const originalName = await uniqueStoredImageName(originalFilename || `design.${extension}`, `.${extension}`);
  const stem = originalName.slice(0, originalName.lastIndexOf('.'));
  let previewName = originalName.toLowerCase().endsWith('.webp') ? `${stem}-preview.webp` : `${stem}.webp`;
  if (previewName.toLowerCase() === originalName.toLowerCase()) {
    previewName = `${stem}-preview.webp`;
  }
  previewName = await uniqueStoredImageName(previewName, '.webp');
  try {
    const [preview] = await uploadFile([asUpload(previewName, previewBuffer, 'image/webp')], '');
    await uploadFile([asUpload(originalName, originalBuffer, mimetype)], '');
    return { imageUrl: preview.url, originalName, previewName };
  } catch (failure) {
    await removeStoredDesignFiles(originalName, previewName);
    throw failure;
  }
}

function remoteKey(name: string, legacyDir: string): string {
  if (STORED_FILE_NAME.test(name)) {
    return `${legacyDir}/${name}`;
  }
  return ROOT_FILE_NAME.test(name) ? name : '';
}

async function removeStoredDesignFiles(originalName: string, previewName: string): Promise<void> {
  const localFiles = [
    STORED_FILE_NAME.test(originalName) ? path.join(CONSTANTS.MEDIAPATH, ORIGINAL_DIR, originalName) : '',
    STORED_FILE_NAME.test(previewName) ? path.join(CONSTANTS.MEDIAPATH, PREVIEW_DIR, previewName) : ''
  ].filter((file) => file);
  await Promise.all(
    localFiles.map((file) => fs.rm(file, { force: true }).catch((failure) => logError(failure)))
  );
  if (getFileStorageProvider() === 'local') {
    return;
  }
  const remote = [remoteKey(originalName, CLOUD_ORIGINAL_DIR), remoteKey(previewName, PREVIEW_DIR)].filter(
    (key) => key
  );
  await Promise.all(remote.map((key) => deleteFile(key).catch((failure) => logError(failure))));
}

function previewNameFromImage(image: string, uuid: string): string {
  const legacy = `${uuid}.webp`;
  if (image.endsWith(`/assets/${PREVIEW_DIR}/${legacy}`)) {
    return legacy;
  }
  try {
    const pathname = image.startsWith('http') ? new URL(image).pathname : image;
    const last = decodeURIComponent(pathname.split('/').filter(Boolean).pop() || '');
    if (STORED_FILE_NAME.test(last) || ROOT_FILE_NAME.test(last)) {
      return last;
    }
  } catch {
    // Keep the legacy preview name below.
  }
  return legacy;
}

/** Preview bytes for the shop. Never the print original. */
export async function openDesignPreview(
  design: Pick<DesignRow, 'uuid' | 'image'>
): Promise<StoredObject | null> {
  const name = previewNameFromImage(design.image, design.uuid);
  if (design.image.startsWith('/assets/')) {
    const local = path.join(CONSTANTS.MEDIAPATH, PREVIEW_DIR, `${design.uuid}.webp`);
    try {
      await fs.access(local);
      return { stream: createReadStream(local), contentType: 'image/webp' };
    } catch {
      return null;
    }
  }
  const key = remoteKey(name, PREVIEW_DIR);
  return key ? openStoredObject(key) : null;
}

/** Local print file when it is still on disk; otherwise the object in the bucket. */
export async function openDesignOriginal(
  design: Pick<DesignRow, 'original_file'>
): Promise<StoredObject | null> {
  const local = originalFilePath(design);
  if (local) {
    try {
      await fs.access(local);
      const extension = design.original_file.split('.').pop()?.toLowerCase() || '';
      return { stream: createReadStream(local), contentType: ORIGINAL_MIME[extension] };
    } catch {
      // Uploaded after file storage moved to a bucket.
    }
  }
  if (getFileStorageProvider() === 'local') {
    return null;
  }
  const key = remoteKey(design.original_file, CLOUD_ORIGINAL_DIR);
  return key ? openStoredObject(key) : null;
}

export interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  originalname?: string;
  size: number;
}

async function openDesignCount(profileId: number): Promise<number> {
  const row = await one<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM "designer_design"
      WHERE "designer_profile_id" = $1 AND "status" IN ('draft', 'pending', 'rejected')`,
    [profileId]
  );
  return row?.count ?? 0;
}

/**
 * Checks the bytes, not the browser's type: sharp must read the file, and
 * what it reads must be one of the accepted formats.
 */
export async function inspectDesignFile(file: UploadedFile): Promise<{
  extension: string;
  width: number;
  height: number;
  dpi: number | null;
}> {
  if (!(DESIGN_FILE_TYPES as readonly string[]).includes(file.mimetype)) {
    throw new DesignerError('Upload a PNG, JPEG, TIFF or WebP file.');
  }
  if (file.size > DESIGN_MAX_FILE_MB * 1024 * 1024) {
    throw new DesignerError(`The file is larger than ${DESIGN_MAX_FILE_MB} MB.`);
  }
  let meta: Awaited<ReturnType<ReturnType<typeof sharp>['metadata']>>;
  try {
    meta = await sharp(file.buffer, { limitInputPixels: 30000 * 30000 }).metadata();
  } catch {
    throw new DesignerError('That file could not be read as an image.');
  }
  const actual = meta.format ? SHARP_FORMATS[meta.format] : undefined;
  if (!actual) {
    throw new DesignerError('Upload a PNG, JPEG, TIFF or WebP file.');
  }
  if ((meta.pages ?? 1) > 1) {
    throw new DesignerError('Upload a single image, not an animation or a multi-page file.');
  }
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  if (Math.min(width, height) < DESIGN_MIN_SIDE_PX) {
    throw new DesignerError(
      `The design is ${width} × ${height} px. Each side must be at least ${DESIGN_MIN_SIDE_PX} px for a clean print.`
    );
  }
  return {
    extension: EXTENSIONS[actual],
    width,
    height,
    dpi: meta.density ? Math.round(meta.density) : null
  };
}

export async function createDesign(
  profile: ProfileRow,
  file: UploadedFile | undefined,
  raw: unknown
): Promise<DesignRow> {
  if (profile.status === 'suspended') {
    throw new DesignerError('Your designer account is suspended. You cannot add designs.', 403);
  }
  if (!file) {
    throw new DesignerError('Choose the design file to upload.');
  }
  const details = checkDesignDetails(raw);
  if (!details.ok) {
    throw new DesignerError(details.message);
  }
  if ((await openDesignCount(profile.designer_profile_id)) >= DESIGN_MAX_OPEN) {
    throw new DesignerError(
      `You already have ${DESIGN_MAX_OPEN} designs that are not live yet. Finish or delete some first.`
    );
  }
  const info = await inspectDesignFile(file);
  const hash = createHash('sha256').update(file.buffer).digest('hex');
  const duplicate = await one<{ designer_profile_id: number }>(
    `SELECT "designer_profile_id" FROM "designer_design" WHERE "file_hash" = $1`,
    [hash]
  );
  if (duplicate) {
    throw new DesignerError(
      duplicate.designer_profile_id === profile.designer_profile_id
        ? 'You have already uploaded this exact file.'
        : 'This exact file is already in the shop under another designer.'
    );
  }

  const id = randomUUID();
  const previewBuffer = await sharp(file.buffer, { limitInputPixels: 30000 * 30000 })
    .rotate()
    .resize(PREVIEW_MAX_PX, PREVIEW_MAX_PX, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  let originalName = '';
  let previewName = '';
  try {
    const stored = await storeDesignFiles(
      id,
      info.extension,
      file.buffer,
      previewBuffer,
      file.mimetype,
      String(file.originalname || '')
    );
    originalName = stored.originalName;
    previewName = stored.previewName;
    const imageUrl = stored.imageUrl;
    const row = await one<DesignRow>(
      `INSERT INTO "designer_design"
         ("uuid", "designer_profile_id", "name", "description", "category", "colors", "tags",
          "repeat_type", "image", "original_file", "original_name", "file_hash",
          "width_px", "height_px", "dpi", "status")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'draft')
       RETURNING *`,
      [
        id,
        profile.designer_profile_id,
        details.value.name,
        details.value.description,
        details.value.category,
        details.value.colors,
        details.value.tags,
        details.value.repeatType,
        imageUrl,
        originalName,
        String(file.originalname || '').slice(0, 200) || null,
        hash,
        info.width,
        info.height,
        info.dpi
      ]
    );
    return row as DesignRow;
  } catch (failure) {
    await removeStoredDesignFiles(originalName, previewName);
    if ((failure as { code?: string }).code === '23505') {
      throw new DesignerError('You have already uploaded this exact file.');
    }
    throw failure;
  }
}

async function ownDesign(profile: ProfileRow, uuid: string): Promise<DesignRow> {
  if (!/^[0-9a-f-]{36}$/i.test(uuid)) {
    throw new DesignerError('That design was not found.', 404);
  }
  const design = await one<DesignRow>(
    `SELECT * FROM "designer_design" WHERE "uuid" = $1 AND "designer_profile_id" = $2`,
    [uuid, profile.designer_profile_id]
  );
  if (!design) {
    throw new DesignerError('That design was not found.', 404);
  }
  return design;
}

export async function updateDesignDetails(
  profile: ProfileRow,
  uuid: string,
  raw: unknown
): Promise<DesignRow> {
  const design = await ownDesign(profile, uuid);
  if (!designerCan(design.status, 'edit')) {
    throw new DesignerError(`A design that is ${designStatusLabel(design.status).toLowerCase()} cannot be edited.`);
  }
  const details = checkDesignDetails(raw);
  if (!details.ok) {
    throw new DesignerError(details.message);
  }
  return (await one<DesignRow>(
    `UPDATE "designer_design" SET "name" = $2, "description" = $3, "category" = $4,
       "colors" = $5, "tags" = $6, "repeat_type" = $7, "updated_at" = NOW()
     WHERE "designer_design_id" = $1 RETURNING *`,
    [
      design.designer_design_id,
      details.value.name,
      details.value.description,
      details.value.category,
      details.value.colors,
      details.value.tags,
      details.value.repeatType
    ]
  )) as DesignRow;
}

export async function submitDesign(profile: ProfileRow, uuid: string): Promise<DesignRow> {
  if (profile.status === 'suspended') {
    throw new DesignerError('Your designer account is suspended. You cannot submit designs.', 403);
  }
  if (!hasCurrentAgreement(profile)) {
    throw new DesignerError('Accept the current Seller Agreement in your profile before submitting designs.');
  }
  const design = await ownDesign(profile, uuid);
  if (!designerCan(design.status, 'submit')) {
    throw new DesignerError(`A design that is ${designStatusLabel(design.status).toLowerCase()} cannot be submitted.`);
  }
  return (await one<DesignRow>(
    `UPDATE "designer_design" SET "status" = 'pending', "submitted_at" = NOW(), "updated_at" = NOW()
     WHERE "designer_design_id" = $1 AND "status" = $2 RETURNING *`,
    [design.designer_design_id, design.status]
  )) as DesignRow;
}

/**
 * Takes the design out of the picker. Orders already placed keep their copy
 * of the design and the print file stays for production.
 */
export async function withdrawDesign(profile: ProfileRow, uuid: string): Promise<DesignRow> {
  const design = await ownDesign(profile, uuid);
  if (!designerCan(design.status, 'withdraw')) {
    throw new DesignerError(`A design that is ${designStatusLabel(design.status).toLowerCase()} cannot be withdrawn.`);
  }
  return (await one<DesignRow>(
    `UPDATE "designer_design" SET "status" = 'withdrawn', "updated_at" = NOW()
     WHERE "designer_design_id" = $1 AND "status" = $2 RETURNING *`,
    [design.designer_design_id, design.status]
  )) as DesignRow;
}

/** Only designs that never sold. A sold design is withdrawn instead, so production keeps its file. */
export async function deleteDesign(profile: ProfileRow, uuid: string): Promise<void> {
  const design = await ownDesign(profile, uuid);
  if (!designerCan(design.status, 'delete')) {
    throw new DesignerError(`A design that is ${designStatusLabel(design.status).toLowerCase()} cannot be deleted. Withdraw it instead.`);
  }
  const sold = await one(
    `SELECT 1 FROM "designer_wallet_entry" WHERE "designer_design_id" = $1 LIMIT 1`,
    [design.designer_design_id]
  );
  if (sold || design.sales_count > 0 || design.sku) {
    throw new DesignerError('This design has been listed or sold, so it is kept for production. Withdraw it instead.');
  }
  const ordered = await one(
    `SELECT 1 FROM "order_item" WHERE "product_custom_options" LIKE $1 LIMIT 1`,
    [`%${design.uuid}%`]
  );
  const inCart = await one(
    `SELECT 1 FROM "cart_item" WHERE "product_custom_options" LIKE $1 LIMIT 1`,
    [`%${design.uuid}%`]
  );
  if (ordered || inCart) {
    throw new DesignerError('This design is in a shopper\'s cart or order, so it is kept. Withdraw it instead.');
  }
  await one(`DELETE FROM "designer_design" WHERE "designer_design_id" = $1`, [design.designer_design_id]);
  await removeStoredDesignFiles(
    design.original_file,
    previewNameFromImage(design.image, design.uuid)
  );
}

export async function myDesigns(profileId: number): Promise<DesignRow[]> {
  return rows<DesignRow>(
    `SELECT * FROM "designer_design" WHERE "designer_profile_id" = $1 ORDER BY "created_at" DESC`,
    [profileId]
  );
}

export interface PublicDesignRow extends DesignRow {
  designer_name: string;
  designer_slug: string;
}

/** Live means approved, by a verified designer whose account is active. */
const LIVE = `d."status" = 'approved' AND p."status" = 'verified' AND c."status" = 1`;
const LIVE_FROM = `"designer_design" d
  JOIN "designer_profile" p ON p."designer_profile_id" = d."designer_profile_id"
  JOIN "customer" c ON c."customer_id" = p."customer_id"`;

export interface DesignFilters {
  category?: string | null;
  color?: string | null;
  designer?: string | null;
  uuid?: string | null;
  q?: string | null;
  sort?: string | null;
  page?: number;
  limit?: number;
}

export async function listLiveDesigns(filters: DesignFilters): Promise<{
  items: PublicDesignRow[];
  total: number;
  page: number;
  limit: number;
}> {
  const limit = Math.min(48, Math.max(1, Math.floor(filters.limit ?? 24)));
  const page = Math.max(1, Math.floor(filters.page ?? 1));
  const where = [LIVE];
  const params: unknown[] = [];
  if (filters.category) {
    params.push(filters.category);
    where.push(`d."category" = $${params.length}`);
  }
  if (filters.color) {
    params.push(filters.color);
    where.push(`$${params.length} = ANY(d."colors")`);
  }
  if (filters.designer) {
    params.push(filters.designer);
    where.push(`p."slug" = $${params.length}`);
  }
  if (filters.uuid) {
    if (!/^[0-9a-f-]{36}$/i.test(filters.uuid)) {
      return { items: [], total: 0, page: 1, limit };
    }
    params.push(filters.uuid);
    where.push(`d."uuid" = $${params.length}`);
  }
  const q = (filters.q || '').trim().slice(0, 60);
  if (q) {
    params.push(`%${q.replace(/[%_\\]/g, (char) => `\\${char}`)}%`);
    const at = params.length;
    params.push(q.toLowerCase());
    where.push(
      `(d."name" ILIKE $${at} OR p."display_name" ILIKE $${at} OR d."sku" ILIKE $${at} OR $${params.length} = ANY(d."tags"))`
    );
  }
  const order =
    filters.sort === 'best'
      ? `d."sales_count" DESC, d."approved_at" DESC`
      : `d."approved_at" DESC, d."designer_design_id" DESC`;
  const total = await one<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM ${LIVE_FROM} WHERE ${where.join(' AND ')}`,
    params
  );
  const items = await rows<PublicDesignRow>(
    `SELECT d.*, p."display_name" AS designer_name, p."slug" AS designer_slug
       FROM ${LIVE_FROM}
      WHERE ${where.join(' AND ')}
      ORDER BY ${order}
      LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
    params
  );
  return { items, total: total?.count ?? 0, page, limit };
}

export async function liveDesign(uuid: string): Promise<PublicDesignRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(uuid)) {
    return null;
  }
  return one<PublicDesignRow>(
    `SELECT d.*, p."display_name" AS designer_name, p."slug" AS designer_slug
       FROM ${LIVE_FROM}
      WHERE ${LIVE} AND d."uuid" = $1`,
    [uuid]
  );
}

/** Designers who have at least one live design, for the picker's filter. */
export async function liveDesigners(): Promise<{ slug: string; display_name: string; count: number }[]> {
  return rows(
    `SELECT p."slug", p."display_name", COUNT(*)::int AS count
       FROM ${LIVE_FROM}
      WHERE ${LIVE}
      GROUP BY p."slug", p."display_name"
      ORDER BY p."display_name"`
  );
}

export async function designByUuid(uuid: string): Promise<DesignRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(uuid)) {
    return null;
  }
  return one<DesignRow>(`SELECT * FROM "designer_design" WHERE "uuid" = $1`, [uuid]);
}

export interface ReviewRow extends DesignRow {
  designer_name: string;
  designer_uuid: string;
  designer_status: string;
  designer_agreement: string | null;
}

export async function adminListDesigns(status: string | null): Promise<ReviewRow[]> {
  return rows<ReviewRow>(
    `SELECT d.*, p."display_name" AS designer_name, p."uuid" AS designer_uuid,
            p."status" AS designer_status, p."agreement_version" AS designer_agreement
       FROM "designer_design" d
       JOIN "designer_profile" p ON p."designer_profile_id" = d."designer_profile_id"
      WHERE ($1::text IS NULL OR d."status" = $1) AND d."status" <> 'draft'
      ORDER BY (d."status" = 'pending') DESC, d."submitted_at" ASC NULLS LAST, d."created_at" DESC
      LIMIT 200`,
    [status]
  );
}

export type ReviewAction = 'approve' | 'reject' | 'hide' | 'restore';

export async function reviewDesign(
  uuid: string,
  action: ReviewAction,
  note: string | null
): Promise<DesignRow> {
  const design = await designByUuid(uuid);
  if (!design) {
    throw new DesignerError('That design no longer exists.', 404);
  }
  if (!reviewerCan(design.status, action)) {
    throw new DesignerError(
      `A design that is ${designStatusLabel(design.status).toLowerCase()} cannot be ${
        action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'hide' ? 'hidden' : 'restored'
      }.`
    );
  }
  const profile = (await one<ProfileRow>(
    `SELECT * FROM "designer_profile" WHERE "designer_profile_id" = $1`,
    [design.designer_profile_id]
  )) as ProfileRow;
  if ((action === 'approve' || action === 'restore') && profile.status !== 'verified') {
    throw new DesignerError('Verify the designer before approving their designs.');
  }
  if (action === 'reject' && !note) {
    throw new DesignerError('Tell the designer what to change.');
  }
  const updated = await inTransaction(async (client) => {
    if (action === 'approve') {
      return (await one<DesignRow>(
        `UPDATE "designer_design" SET "status" = 'approved', "review_note" = $2,
           "sku" = COALESCE("sku", $3), "approved_at" = COALESCE("approved_at", NOW()), "updated_at" = NOW()
         WHERE "designer_design_id" = $1 AND "status" = $4 RETURNING *`,
        [design.designer_design_id, note, designSku(design.designer_design_id), design.status],
        client
      )) as DesignRow;
    }
    const next = action === 'reject' ? 'rejected' : action === 'hide' ? 'hidden' : 'approved';
    return (await one<DesignRow>(
      `UPDATE "designer_design" SET "status" = $2, "review_note" = $3, "updated_at" = NOW()
       WHERE "designer_design_id" = $1 AND "status" = $4 RETURNING *`,
      [design.designer_design_id, next, note, design.status],
      client
    )) as DesignRow;
  });
  if (!updated) {
    throw new DesignerError('Someone else changed this design. Reload and try again.', 409);
  }
  const messages: Record<ReviewAction, string> = {
    approve: `"${updated.name}" is live in the shop with code ${updated.sku}. Use this code when you write to us about it.`,
    reject: `"${updated.name}" needs changes before it can go live: ${note}`,
    hide: `"${updated.name}" has been hidden from the shop.${note ? ` Reason: ${note}` : ''}`,
    restore: `"${updated.name}" is back in the shop.`
  };
  const subjects: Record<ReviewAction, string> = {
    approve: 'Your design is live',
    reject: 'Your design needs changes',
    hide: 'Your design was hidden',
    restore: 'Your design is back in the shop'
  };
  await notifyDesigner(profile, subjects[action], messages[action]);
  return updated;
}
