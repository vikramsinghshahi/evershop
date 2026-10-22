import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const sendEmail = jest.fn(async () => undefined);

let configured = true;
const isEmailConfigured = jest.fn(async () => configured);

const getStoreLanguage = jest.fn(async () => 'en');

let configValue: any = { enabled: true };
const getConfig = jest.fn(() => configValue);

const getValue = jest.fn(async (_name: string, value: any) => value);
const translate = jest.fn((text: string) => text);
const debug = jest.fn();
const warning = jest.fn();

jest.unstable_mockModule('../../../../lib/mail/emailHelper.js', () => ({
  sendEmail
}));
jest.unstable_mockModule('../../../../lib/mail/resendEmailService.js', () => ({
  isEmailConfigured
}));
jest.unstable_mockModule('../../../setting/services/setting.js', () => ({
  getStoreLanguage
}));
jest.unstable_mockModule('../../../../lib/util/getConfig.js', () => ({
  getConfig
}));
jest.unstable_mockModule('../../../../lib/util/registry.js', () => ({
  getValue
}));
jest.unstable_mockModule('../../../../lib/locale/translate/translate.js', () => ({
  translate
}));
jest.unstable_mockModule('../../../../lib/log/logger.js', () => ({
  debug,
  warning
}));
jest.unstable_mockModule('../../../../lib/router/buildAbsoluteUrl.js', () => ({
  buildAbsoluteUrl: () => 'http://localhost/account/reset-password'
}));

const { isResetMailReady, sendResetPasswordEmail } = await import(
  '../../services/sendResetPasswordEmail.js'
);

const customer = { customer_id: 1, email: 'jane@example.com' };

describe('sendResetPasswordEmail', () => {
  beforeEach(() => {
    configured = true;
    configValue = { enabled: true };
    jest.clearAllMocks();
  });

  it('sends a reset_password email with the token in the link', async () => {
    expect(await isResetMailReady()).toBe(true);
    await sendResetPasswordEmail('jane@example.com', customer, 'plain-token');

    expect(sendEmail).toHaveBeenCalledTimes(1);
    const [id, args] = sendEmail.mock.calls[0] as any[];
    expect(id).toBe('reset_password');
    expect(args.to).toBe('jane@example.com');
    expect(args.data.resetPasswordUrl).toContain('plain-token');
  });

  it('reports rather than throws when Resend is not configured', async () => {
    configured = false;

    expect(await isResetMailReady()).toBe(false);
    await sendResetPasswordEmail('jane@example.com', customer, 'plain-token');

    expect(sendEmail).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalled();
    expect(String(warning.mock.calls[0][0])).toMatch(/Resend API key is not set/);
  });

  it('respects the config kill switch', async () => {
    configValue = { enabled: false };

    expect(await isResetMailReady()).toBe(false);
    await sendResetPasswordEmail('jane@example.com', customer, 'plain-token');

    expect(sendEmail).not.toHaveBeenCalled();
    expect(String(warning.mock.calls[0][0])).toMatch(/disabled/i);
  });
});
