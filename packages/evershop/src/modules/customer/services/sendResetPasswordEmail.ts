import fs from 'fs/promises';
import path from 'path';
import { CONSTANTS } from '../../../lib/helpers.js';
import { translate } from '../../../lib/locale/translate/translate.js';
import { debug, warning } from '../../../lib/log/logger.js';
import { sendEmail } from '../../../lib/mail/emailHelper.js';
import { isEmailConfigured } from '../../../lib/mail/resendEmailService.js';
import { buildAbsoluteUrl } from '../../../lib/router/buildAbsoluteUrl.js';
import { getConfig } from '../../../lib/util/getConfig.js';
import { getValue } from '../../../lib/util/registry.js';
import { getStoreLanguage } from '../../setting/services/setting.js';

const TEMPLATE = `{{#> emailLayout preheader=(t "Reset your \${store} password." store=storeInfo.storeName)}}
<h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;font-weight:700;color:#111114;">{{t "Reset your password"}}</h1>
<p style="margin:0 0 16px;">{{t "We received a request to reset the password for your \${store} account. Choose a new one below." store=storeInfo.storeName}}</p>
{{> button href=resetPasswordUrl label=(t "Reset password")}}
<p style="margin:16px 0 0;font-size:14px;color:#6b7280;">{{t "If you didn't request this, you can safely ignore this email — your password won't change."}}</p>
{{/emailLayout}}`;

function resetMailConfig() {
  return getConfig('system.notification_emails.reset_password', {
    enabled: true
  });
}

/** Store-wide. Same answer whether or not the address has an account. */
export async function isResetMailReady(): Promise<boolean> {
  const config = resetMailConfig();
  return config?.enabled !== false && (await isEmailConfigured());
}

/**
 * Sends the reset-password notification. No-ops when mail is disabled or
 * Resend is not configured, so the API can stay a 200.
 * The reset URL stays inside the message; it is not returned.
 */
export async function sendResetPasswordEmail(
  email,
  existingCustomer,
  token
): Promise<void> {
  const config = resetMailConfig();
  if (!(await isResetMailReady())) {
    warning(
      config?.enabled === false
        ? 'Reset password email is disabled in config.'
        : 'Reset password email not sent: Resend API key is not set.'
    );
    return;
  }

  const url = buildAbsoluteUrl('resetPasswordPage');
  const resetPasswordUrl = `${url}?token=${token}`;

  // Triggered from an /api route, which the locale middleware skips — no ALS locale (D7).
  // Resolve the store default explicitly.
  const locale = await getStoreLanguage();
  const subject = translate('Reset your password', {}, locale);
  let template = '';
  // Check if templatePath is set in config and the file is exists. It should be relative to the project root
  if (config?.templatePath) {
    const filePath = path.join(CONSTANTS.ROOTPATH, config.templatePath);
    try {
      await fs.access(filePath);
      template = await fs.readFile(filePath, 'utf8');
    } catch (error) {
      debug(
        `Reset password email template file not found at path: ${filePath}. Using default template.`
      );
      template = TEMPLATE;
    }
  } else {
    template = TEMPLATE;
  }
  const dynamicData = await getValue('resetPasswordEmailData', {
    token,
    resetPasswordUrl,
    customer: existingCustomer
  });
  const args = await getValue(
    'resetPasswordEmailArguments',
    {
      to: email,
      subject,
      template,
      data: dynamicData,
      locale
    },
    { customer: existingCustomer, token }
  );
  await sendEmail('reset_password', args);
}
