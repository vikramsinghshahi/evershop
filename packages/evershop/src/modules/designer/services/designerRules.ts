/**
 * Rules shared by the designer pages, the APIs and the admin. No database
 * access here, so the storefront bundle can import it.
 */

export const AGREEMENT_VERSION = '2026-10';

export const DESIGNER_STATUSES = ['pending', 'verified', 'suspended'] as const;
export type DesignerStatus = (typeof DESIGNER_STATUSES)[number];

export const DESIGN_STATUSES = [
  'draft',
  'pending',
  'approved',
  'rejected',
  'hidden',
  'withdrawn'
] as const;
export type DesignStatus = (typeof DESIGN_STATUSES)[number];

export const DESIGN_CATEGORIES = [
  'Abstract',
  'Animals & Birds',
  'Animal Skins',
  'Ethnic & Traditional',
  'Floral',
  'Geometric',
  'Historical',
  'Modern',
  'Nature',
  'Nautical',
  'Novelty',
  'Outline',
  'Party & Themes',
  'Quotes',
  'Space',
  'Texture',
  'Tropical'
] as const;

export const DESIGN_COLORS = [
  'Black',
  'Blue',
  'Brown',
  'Green',
  'Grey',
  'Indigo',
  'Orange',
  'Pink',
  'Red',
  'Turquoise',
  'Violet',
  'White',
  'Yellow'
] as const;

/** Layouts a designer can recommend. Matches the picker's layout buttons. */
export const REPEAT_TYPES = ['tile', 'mirror', 'vertical', 'brick', 'center'] as const;
export type RepeatType = (typeof REPEAT_TYPES)[number];

export const DESIGN_FILE_TYPES = ['image/png', 'image/jpeg', 'image/tiff', 'image/webp'] as const;
export const DESIGN_MAX_FILE_MB = 50;
/** Shortest side. Below this a design prints soft at any useful size. */
export const DESIGN_MIN_SIDE_PX = 600;
export const DESIGN_MAX_TAGS = 10;
/** Drafts plus designs waiting for review, per designer. */
export const DESIGN_MAX_OPEN = 50;

const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'account',
  'designer',
  'designers',
  'designs',
  'new',
  'edit',
  'me',
  'tex-india',
  'texindia'
]);

export type Check<T> = { ok: true; value: T } | { ok: false; message: string };

function clean(raw: unknown, max: number): string {
  if (typeof raw !== 'string') {
    return '';
  }
  return raw
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function cleanText(raw: unknown, max: number): string {
  if (typeof raw !== 'string') {
    return '';
  }
  return raw
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

export function slugify(raw: unknown): string {
  return clean(raw, 120)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

export function checkSlug(raw: unknown): Check<string> {
  const slug = slugify(raw);
  if (slug.length < 3) {
    return { ok: false, message: 'The profile address needs at least 3 letters or numbers.' };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { ok: false, message: 'That profile address is reserved. Choose another.' };
  }
  return { ok: true, value: slug };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IFSC = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export interface PayoutBank {
  accountName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
}

export interface ProfileInput {
  displayName: string;
  slug: string;
  studioName: string | null;
  bio: string | null;
  payoutMethod: 'paypal' | 'bank' | null;
  payoutPaypalEmail: string | null;
  payoutBank: PayoutBank | null;
  gstin: string | null;
  pan: string | null;
  acceptAgreement: boolean;
}

/**
 * The designer's own form. Payout details are optional until the first
 * payout; the agreement is required before anything is submitted for review.
 */
export function checkProfileInput(raw: unknown): Check<ProfileInput> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, message: 'Fill in your designer profile.' };
  }
  const body = raw as Record<string, unknown>;
  const displayName = clean(body.displayName, 80);
  if (displayName.length < 2) {
    return { ok: false, message: 'Enter the name shoppers will see on your designs.' };
  }
  const slug = checkSlug(body.slug || displayName);
  if (!slug.ok) {
    return slug;
  }
  const studioName = clean(body.studioName, 120) || null;
  const bio = cleanText(body.bio, 1500) || null;

  let payoutMethod: ProfileInput['payoutMethod'] = null;
  let payoutPaypalEmail: string | null = null;
  let payoutBank: PayoutBank | null = null;
  if (body.payoutMethod === 'paypal') {
    payoutMethod = 'paypal';
    payoutPaypalEmail = clean(body.payoutPaypalEmail, 160).toLowerCase();
    if (!EMAIL.test(payoutPaypalEmail)) {
      return { ok: false, message: 'Enter the PayPal email that should receive your commission.' };
    }
  } else if (body.payoutMethod === 'bank') {
    payoutMethod = 'bank';
    const bank = (body.payoutBank && typeof body.payoutBank === 'object'
      ? body.payoutBank
      : {}) as Record<string, unknown>;
    const accountName = clean(bank.accountName, 120);
    const accountNumber = clean(bank.accountNumber, 30).replace(/\s/g, '');
    const ifsc = clean(bank.ifsc, 11).toUpperCase();
    const bankName = clean(bank.bankName, 120);
    if (accountName.length < 2) {
      return { ok: false, message: 'Enter the account holder name.' };
    }
    if (!/^[0-9]{6,20}$/.test(accountNumber)) {
      return { ok: false, message: 'The bank account number should be 6 to 20 digits.' };
    }
    if (!IFSC.test(ifsc)) {
      return { ok: false, message: 'Enter a valid IFSC code, for example HDFC0001234.' };
    }
    payoutBank = { accountName, accountNumber, ifsc, bankName };
  } else if (body.payoutMethod !== undefined && body.payoutMethod !== null && body.payoutMethod !== '') {
    return { ok: false, message: 'Choose PayPal or bank transfer for payouts.' };
  }

  const gstin = clean(body.gstin, 15).toUpperCase() || null;
  if (gstin && !GSTIN.test(gstin)) {
    return { ok: false, message: 'That GSTIN does not look right. Leave it blank if you are not registered.' };
  }
  const pan = clean(body.pan, 10).toUpperCase() || null;
  if (pan && !PAN.test(pan)) {
    return { ok: false, message: 'That PAN does not look right.' };
  }

  return {
    ok: true,
    value: {
      displayName,
      slug: slug.value,
      studioName,
      bio,
      payoutMethod,
      payoutPaypalEmail,
      payoutBank,
      gstin,
      pan,
      acceptAgreement: body.acceptAgreement === true || body.acceptAgreement === 'true'
    }
  };
}

export interface DesignDetails {
  name: string;
  description: string | null;
  category: string;
  colors: string[];
  tags: string[];
  repeatType: RepeatType;
}

function list(raw: unknown): unknown[] {
  if (Array.isArray(raw)) {
    return raw;
  }
  if (typeof raw === 'string') {
    const text = raw.trim();
    if (text.startsWith('[')) {
      try {
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return text ? text.split(',') : [];
  }
  return [];
}

export function checkDesignDetails(raw: unknown): Check<DesignDetails> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, message: 'Describe the design.' };
  }
  const body = raw as Record<string, unknown>;
  const name = clean(body.name, 80);
  if (name.length < 2) {
    return { ok: false, message: 'Give the design a name.' };
  }
  const category = clean(body.category, 40);
  if (!(DESIGN_CATEGORIES as readonly string[]).includes(category)) {
    return { ok: false, message: 'Choose a category for the design.' };
  }
  const colors = [
    ...new Set(
      list(body.colors)
        .map((color) => clean(color, 20))
        .filter((color) => (DESIGN_COLORS as readonly string[]).includes(color))
    )
  ];
  if (colors.length === 0) {
    return { ok: false, message: 'Pick at least one main colour.' };
  }
  const tags = [
    ...new Set(
      list(body.tags)
        .map((tag) => clean(tag, 30).toLowerCase())
        .filter((tag) => tag.length >= 2)
    )
  ].slice(0, DESIGN_MAX_TAGS);
  const repeat = clean(body.repeatType, 20) || 'tile';
  if (!(REPEAT_TYPES as readonly string[]).includes(repeat)) {
    return { ok: false, message: 'Choose how the design repeats.' };
  }
  return {
    ok: true,
    value: {
      name,
      description: cleanText(body.description, 600) || null,
      category,
      colors,
      tags,
      repeatType: repeat as RepeatType
    }
  };
}

/** What a designer may do to their own design in each state. */
export const DESIGNER_ACTIONS: Record<DesignStatus, readonly ('edit' | 'submit' | 'withdraw' | 'delete')[]> = {
  draft: ['edit', 'submit', 'delete'],
  pending: ['edit', 'withdraw'],
  approved: ['edit', 'withdraw'],
  rejected: ['edit', 'submit', 'delete'],
  hidden: ['withdraw'],
  withdrawn: ['submit', 'delete']
};

export function designerCan(
  status: string,
  action: 'edit' | 'submit' | 'withdraw' | 'delete'
): boolean {
  return (DESIGNER_ACTIONS[status as DesignStatus] ?? []).includes(action);
}

/** What the admin may do to a design in each state. */
export const REVIEW_ACTIONS: Record<DesignStatus, readonly ('approve' | 'reject' | 'hide' | 'restore')[]> = {
  draft: [],
  pending: ['approve', 'reject'],
  approved: ['hide'],
  rejected: ['approve'],
  hidden: ['restore'],
  withdrawn: []
};

export function reviewerCan(status: string, action: 'approve' | 'reject' | 'hide' | 'restore'): boolean {
  return (REVIEW_ACTIONS[status as DesignStatus] ?? []).includes(action);
}

export function designSku(designId: number): string {
  return `D-${String(designId).padStart(5, '0')}`;
}

export function designStatusLabel(status: string): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'pending':
      return 'In review';
    case 'approved':
      return 'Live';
    case 'rejected':
      return 'Needs changes';
    case 'hidden':
      return 'Hidden by the shop';
    case 'withdrawn':
      return 'Withdrawn';
    default:
      return status;
  }
}

export function designerStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Waiting for verification';
    case 'verified':
      return 'Verified designer';
    case 'suspended':
      return 'Suspended';
    default:
      return status;
  }
}

/** Account number shown to the designer and in the admin: last four digits only. */
export function maskAccount(accountNumber: string | null | undefined): string {
  if (!accountNumber) {
    return '';
  }
  return `•••• ${accountNumber.slice(-4)}`;
}
