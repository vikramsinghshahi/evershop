import { debug } from '../../../lib/log/logger.js';
import { sendEmail, type SendEmailArguments } from '../../../lib/mail/emailHelper.js';
import { buildAbsoluteUrl } from '../../../lib/router/buildAbsoluteUrl.js';
import { getStoreLanguage } from '../../setting/services/setting.js';
import { one } from './db.js';

const TEMPLATE = `{{#> emailLayout preheader=subject}}
<h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;font-weight:700;color:#111114;">{{subject}}</h1>
<p style="margin:0 0 16px;">{{t "Hello \${name}," name=name}}</p>
<p style="margin:0 0 16px;">{{message}}</p>
{{> button href=dashboardUrl label=(t "Open your designer dashboard")}}
{{/emailLayout}}`;

/**
 * Best effort. A store without an email service, or a mail failure, must not
 * undo the review or payout that triggered the message.
 */
export async function notifyDesigner(
  profile: { customer_id: number | null; display_name: string },
  subject: string,
  message: string
): Promise<void> {
  try {
    if (!profile.customer_id) {
      return;
    }
    const customer = await one<{ email: string; status: number }>(
      `SELECT "email", "status" FROM "customer" WHERE "customer_id" = $1`,
      [profile.customer_id]
    );
    if (!customer || customer.status !== 1) {
      return;
    }
    await sendEmail('designer_notification', {
      to: customer.email,
      subject,
      template: TEMPLATE,
      data: {
        subject,
        message,
        name: profile.display_name,
        dashboardUrl: buildAbsoluteUrl('designerDashboard')
      } as unknown as SendEmailArguments['data'],
      locale: await getStoreLanguage()
    });
  } catch (error) {
    debug(`Designer email "${subject}" was not sent: ${(error as Error).message}`);
  }
}
