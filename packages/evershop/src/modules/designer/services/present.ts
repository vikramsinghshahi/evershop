import { buildUrl } from '../../../lib/router/buildUrl.js';
import { money } from './db.js';
import {
  designerCan,
  designerStatusLabel,
  designStatusLabel,
  maskAccount
} from './designerRules.js';
import type { DesignRow, PublicDesignRow, ReviewRow } from './designs.js';
import type { WalletEntryRow } from './ledger.js';
import { hasCurrentAgreement, type ProfileRow } from './profiles.js';

function iso(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function designerUrl(slug: string): string {
  return buildUrl('designerProfile', { slug });
}

/**
 * The address stored for the preview. A cloud upload is already the public
 * Neon URL, so the browser loads it from the bucket on this machine and on
 * Render. A local upload stays an `/assets` path.
 */
export function shopDesignImage(_uuid: string, image: string): string {
  return image;
}

/** What shoppers see. No file paths beyond the preview. */
export function publicDesign(row: PublicDesignRow) {
  return {
    uuid: row.uuid,
    sku: row.sku,
    name: row.name,
    description: row.description,
    category: row.category,
    colors: row.colors ?? [],
    tags: row.tags ?? [],
    repeatType: row.repeat_type,
    image: shopDesignImage(row.uuid, row.image),
    salesCount: row.sales_count,
    designer: {
      name: row.designer_name,
      slug: row.designer_slug,
      url: designerUrl(row.designer_slug)
    }
  };
}

export function ownDesign(row: DesignRow) {
  return {
    uuid: row.uuid,
    sku: row.sku,
    name: row.name,
    description: row.description,
    category: row.category,
    colors: row.colors ?? [],
    tags: row.tags ?? [],
    repeatType: row.repeat_type,
    image: shopDesignImage(row.uuid, row.image),
    width: row.width_px,
    height: row.height_px,
    dpi: row.dpi,
    status: row.status,
    statusLabel: designStatusLabel(row.status),
    reviewNote: row.review_note,
    salesCount: row.sales_count,
    canEdit: designerCan(row.status, 'edit'),
    canSubmit: designerCan(row.status, 'submit'),
    canWithdraw: designerCan(row.status, 'withdraw'),
    canDelete: designerCan(row.status, 'delete') && !row.sku && row.sales_count === 0,
    createdAt: iso(row.created_at),
    submittedAt: iso(row.submitted_at),
    approvedAt: iso(row.approved_at)
  };
}

export function reviewDesign(row: ReviewRow) {
  return {
    ...ownDesign(row),
    designerName: row.designer_name,
    designerUuid: row.designer_uuid,
    designerStatus: row.designer_status,
    originalName: row.original_name,
    downloadUrl: buildUrl('adminDesignOriginal', { id: row.uuid })
  };
}

/** The designer's own view of their profile. Bank number is masked. */
export function ownProfile(row: ProfileRow) {
  return {
    uuid: row.uuid,
    displayName: row.display_name,
    slug: row.slug,
    studioName: row.studio_name,
    bio: row.bio,
    status: row.status,
    statusLabel: designerStatusLabel(row.status),
    statusNote: row.status_note,
    agreementCurrent: hasCurrentAgreement(row),
    agreementAcceptedAt: iso(row.agreement_accepted_at),
    payoutMethod: row.payout_method,
    payoutPaypalEmail: row.payout_paypal_email,
    payoutBankName: row.payout_bank?.bankName ?? null,
    payoutBankAccount: maskAccount(row.payout_bank?.accountNumber),
    payoutBankHolder: row.payout_bank?.accountName ?? null,
    payoutBankIfsc: row.payout_bank?.ifsc ?? null,
    gstin: row.gstin,
    pan: row.pan,
    commissionRate: row.commission_rate === null ? null : money(row.commission_rate),
    url: row.status === 'verified' ? designerUrl(row.slug) : null
  };
}

export function walletEntry(row: WalletEntryRow) {
  return {
    uuid: row.uuid,
    type: row.type,
    status: row.status,
    amount: money(row.amount),
    baseAmount: row.base_amount === null ? null : money(row.base_amount),
    rate: row.rate === null ? null : money(row.rate),
    description: row.description,
    reference: row.reference,
    orderNumber: row.order_number,
    designName: row.design_name,
    designSku: row.design_sku,
    createdAt: iso(row.created_at)
  };
}
