import { DesignerError, inTransaction, one, rows } from './db.js';
import {
  AGREEMENT_VERSION,
  checkSlug,
  type DesignerStatus,
  type ProfileInput
} from './designerRules.js';
import { notifyDesigner } from './notify.js';

export interface ProfileRow {
  designer_profile_id: number;
  uuid: string;
  customer_id: number | null;
  display_name: string;
  slug: string;
  studio_name: string | null;
  bio: string | null;
  status: DesignerStatus;
  status_note: string | null;
  agreement_version: string | null;
  agreement_accepted_at: Date | null;
  payout_method: 'paypal' | 'bank' | null;
  payout_paypal_email: string | null;
  payout_bank: {
    accountName: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
  } | null;
  commission_rate: string | null;
  gstin: string | null;
  pan: string | null;
  verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export function hasCurrentAgreement(profile: Pick<ProfileRow, 'agreement_version'>): boolean {
  return profile.agreement_version === AGREEMENT_VERSION;
}

export async function profileByCustomer(customerId: number): Promise<ProfileRow | null> {
  return one<ProfileRow>(
    `SELECT * FROM "designer_profile" WHERE "customer_id" = $1`,
    [customerId]
  );
}

/** Public profile: verified, and the customer account still active. */
export async function publicProfileBySlug(slug: string): Promise<ProfileRow | null> {
  return one<ProfileRow>(
    `SELECT p.* FROM "designer_profile" p
       JOIN "customer" c ON c."customer_id" = p."customer_id" AND c."status" = 1
      WHERE p."slug" = $1 AND p."status" = 'verified'`,
    [slug]
  );
}

export async function profileByUuid(uuid: string): Promise<ProfileRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(uuid)) {
    return null;
  }
  return one<ProfileRow>(`SELECT * FROM "designer_profile" WHERE "uuid" = $1`, [uuid]);
}

async function slugTaken(slug: string, exceptProfileId: number | null): Promise<boolean> {
  const row = await one(
    `SELECT 1 FROM "designer_profile" WHERE "slug" = $1 AND ($2::int IS NULL OR "designer_profile_id" <> $2)`,
    [slug, exceptProfileId]
  );
  return row !== null;
}

/**
 * Creates the profile on first save, updates it afterwards. Status is never
 * set here: only the admin verifies or suspends.
 */
export async function saveOwnProfile(
  customerId: number,
  input: ProfileInput
): Promise<ProfileRow> {
  const existing = await profileByCustomer(customerId);
  if (!existing && !input.acceptAgreement) {
    throw new DesignerError('Read and accept the Seller Agreement to become a designer.');
  }
  if (await slugTaken(input.slug, existing?.designer_profile_id ?? null)) {
    throw new DesignerError('Another designer already uses that profile address.');
  }
  const accept = input.acceptAgreement;
  // A payout method that is not chosen keeps what was saved before.
  const keepPayout = input.payoutMethod === null;
  try {
    if (!existing) {
      const created = await one<ProfileRow>(
        `INSERT INTO "designer_profile"
           ("customer_id", "display_name", "slug", "studio_name", "bio",
            "payout_method", "payout_paypal_email", "payout_bank", "gstin", "pan",
            "agreement_version", "agreement_accepted_at")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
         RETURNING *`,
        [
          customerId,
          input.displayName,
          input.slug,
          input.studioName,
          input.bio,
          input.payoutMethod,
          input.payoutPaypalEmail,
          input.payoutBank ? JSON.stringify(input.payoutBank) : null,
          input.gstin,
          input.pan,
          AGREEMENT_VERSION
        ]
      );
      return created as ProfileRow;
    }
    const updated = await one<ProfileRow>(
      `UPDATE "designer_profile" SET
         "display_name" = $2,
         "slug" = $3,
         "studio_name" = $4,
         "bio" = $5,
         "payout_method" = CASE WHEN $6::boolean THEN "payout_method" ELSE $7 END,
         "payout_paypal_email" = CASE WHEN $6::boolean THEN "payout_paypal_email" ELSE $8 END,
         "payout_bank" = CASE WHEN $6::boolean THEN "payout_bank" ELSE $9::jsonb END,
         "gstin" = $10,
         "pan" = $11,
         "agreement_version" = CASE WHEN $12::boolean THEN $13 ELSE "agreement_version" END,
         "agreement_accepted_at" = CASE WHEN $12::boolean THEN NOW() ELSE "agreement_accepted_at" END,
         "updated_at" = NOW()
       WHERE "designer_profile_id" = $1
       RETURNING *`,
      [
        existing.designer_profile_id,
        input.displayName,
        input.slug,
        input.studioName,
        input.bio,
        keepPayout,
        input.payoutMethod,
        input.payoutPaypalEmail,
        input.payoutBank ? JSON.stringify(input.payoutBank) : null,
        input.gstin,
        input.pan,
        accept,
        AGREEMENT_VERSION
      ]
    );
    return updated as ProfileRow;
  } catch (error) {
    if ((error as { code?: string }).code === '23505') {
      throw new DesignerError('Another designer already uses that profile address.');
    }
    throw error;
  }
}

export interface AdminProfileChange {
  status?: DesignerStatus;
  note?: string | null;
  commissionRate?: number | null;
  slug?: string;
}

export async function adminUpdateProfile(
  uuid: string,
  change: AdminProfileChange
): Promise<ProfileRow> {
  const profile = await profileByUuid(uuid);
  if (!profile) {
    throw new DesignerError('That designer no longer exists.', 404);
  }
  if (change.status === 'verified') {
    if (!profile.customer_id) {
      throw new DesignerError('This designer has no customer account any more and cannot be verified.');
    }
    if (!hasCurrentAgreement(profile)) {
      throw new DesignerError('The designer has not accepted the current Seller Agreement yet.');
    }
  }
  let slug = profile.slug;
  if (change.slug !== undefined && change.slug !== profile.slug) {
    const checked = checkSlug(change.slug);
    if (!checked.ok) {
      throw new DesignerError(checked.message);
    }
    if (await slugTaken(checked.value, profile.designer_profile_id)) {
      throw new DesignerError('Another designer already uses that profile address.');
    }
    slug = checked.value;
  }
  const status = change.status ?? profile.status;
  const updated = await inTransaction(async (client) => {
    const row = await one<ProfileRow>(
      `UPDATE "designer_profile" SET
         "status" = $2::text,
         "status_note" = $3,
         "commission_rate" = $4,
         "slug" = $5,
         "verified_at" = CASE WHEN $2::text = 'verified' AND "verified_at" IS NULL THEN NOW() ELSE "verified_at" END,
         "updated_at" = NOW()
       WHERE "designer_profile_id" = $1
       RETURNING *`,
      [
        profile.designer_profile_id,
        status,
        change.note !== undefined ? change.note : profile.status_note,
        change.commissionRate !== undefined ? change.commissionRate : profile.commission_rate,
        slug
      ],
      client
    );
    return row as ProfileRow;
  });
  if (change.status && change.status !== profile.status) {
    const messages: Record<DesignerStatus, string> = {
      verified:
        'Your designer account is verified. Designs you submit can now be approved and listed in the shop.',
      suspended: `Your designer account is suspended. Your designs are hidden from the shop.${
        change.note ? ` Reason: ${change.note}` : ''
      }`,
      pending: 'Your designer account is waiting for verification again.'
    };
    await notifyDesigner(updated, 'Your designer account', messages[change.status]);
  }
  return updated;
}

export interface AdminProfileListRow extends ProfileRow {
  email: string | null;
  customer_status: number | null;
  design_count: number;
  live_count: number;
  pending_count: number;
}

export async function adminListProfiles(status: string | null): Promise<AdminProfileListRow[]> {
  return rows<AdminProfileListRow>(
    `SELECT p.*, c."email", c."status" AS customer_status,
            COUNT(d.*)::int AS design_count,
            COUNT(d.*) FILTER (WHERE d."status" = 'approved')::int AS live_count,
            COUNT(d.*) FILTER (WHERE d."status" = 'pending')::int AS pending_count
       FROM "designer_profile" p
       LEFT JOIN "customer" c ON c."customer_id" = p."customer_id"
       LEFT JOIN "designer_design" d ON d."designer_profile_id" = p."designer_profile_id"
      WHERE ($1::text IS NULL OR p."status" = $1)
      GROUP BY p."designer_profile_id", c."email", c."status"
      ORDER BY (p."status" = 'pending') DESC, p."created_at" DESC`,
    [status]
  );
}

export async function customerEmail(customerId: number | null): Promise<string | null> {
  if (!customerId) {
    return null;
  }
  const row = await one<{ email: string }>(
    `SELECT "email" FROM "customer" WHERE "customer_id" = $1`,
    [customerId]
  );
  return row?.email ?? null;
}
