import { Resend } from 'resend';
import { getSetting } from '../../modules/setting/services/setting.js';
import {
  registerEmailService,
  type SendEmailArguments
} from './emailHelper.js';
import { getConfig } from '../util/getConfig.js';
import { getEnv } from '../util/getEnv.js';
import { isSendableResendFrom } from './fromAddress.js';

const ENV_KEY = 'RESEND_API_KEY';

function trim(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Admin setting first, then `RESEND_API_KEY` in the environment. Read at send
 * time so a key saved in System Setting takes effect without a restart.
 */
export async function getResendApiKey(): Promise<string> {
  const fromSetting = trim(await getSetting('resendApiKey', ''));
  if (fromSetting) {
    return fromSetting;
  }
  return trim(getEnv(ENV_KEY, ''));
}

export function isResendApiKeyPinned(): boolean {
  return Boolean(trim(getEnv(ENV_KEY, '')));
}

export async function isEmailConfigured(): Promise<boolean> {
  return Boolean(await getResendApiKey()) && Boolean(await resolveFromAddress());
}

function formatFrom(name: string, email: string): string {
  if (!email) {
    return '';
  }
  if (email.includes('<')) {
    return email;
  }
  return name ? `${name} <${email}>` : email;
}

/**
 * Prefer the dedicated From field, then store email, then config.
 */
export async function resolveFromAddress(
  alreadySet?: string
): Promise<string> {
  const candidates = [
    trim(alreadySet),
    trim(await getSetting('resendFromEmail', '')),
    formatFrom(
      trim(await getSetting('storeName', 'Store')),
      trim(await getSetting('storeEmail', ''))
    ),
    trim(getConfig('system.notification_emails.from', ''))
  ];
  return candidates.find((value) => isSendableResendFrom(value)) || '';
}

export async function sendWithResend(args: SendEmailArguments): Promise<void> {
  const apiKey = await getResendApiKey();
  if (!apiKey) {
    throw new Error(
      'Resend API key is not set. Add it under Setting → System Setting.'
    );
  }
  const from = await resolveFromAddress(args.from);
  if (!from) {
    throw new Error(
      'From address is missing or invalid. Use email@domain.com or Name <email@domain.com> under Setting → System Setting. For testing, Resend only accepts beth.t@example.com until you verify a domain.'
    );
  }
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html: args.body || '',
    ...(args.replyTo ? { replyTo: args.replyTo } : {}),
    ...(Array.isArray(args.cc) ? { cc: args.cc as string[] } : {})
  });
  if (error) {
    throw new Error(error.message);
  }
}

/** Call from bootstrap. The key is read later, on each send. */
export function registerResendEmailService(): void {
  registerEmailService({
    sendEmail: sendWithResend
  });
}
