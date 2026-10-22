const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

/** Inboxes you can receive on, but cannot send From via Resend without owning the domain. */
const BLOCKED_FROM_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'ymail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'aol.com',
  'protonmail.com',
  'proton.me'
]);

export type FromAddressIssue = 'invalid' | 'blocked';

/**
 * Empty is not an issue here (the admin field is optional).
 * A sendable address is a non-empty value that returns null.
 */
export function classifyFromAddress(value: string): FromAddressIssue | null {
  const v = value.trim();
  if (!v) {
    return null;
  }
  const angled = v.match(/^(.*)<([^>]+)>$/);
  const email = (angled ? angled[2] : v).trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return 'invalid';
  }
  const domain = email.split('@')[1] || '';
  if (BLOCKED_FROM_DOMAINS.has(domain)) {
    return 'blocked';
  }
  return null;
}

/** `email@domain` or `Name <email@domain>`. A display name alone is not sendable. */
export function isSendableResendFrom(value: string): boolean {
  return value.trim() !== '' && classifyFromAddress(value) === null;
}
