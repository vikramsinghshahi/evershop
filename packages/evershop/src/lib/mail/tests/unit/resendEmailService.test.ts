import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

const send = jest.fn(async () => ({ data: { id: 'msg_1' }, error: null as null | { message: string } }));
const Resend = jest.fn().mockImplementation(() => ({
  emails: { send }
}));

const settingValues: Record<string, string> = {};
const getSetting = jest.fn(async (name: string, def: string) =>
  settingValues[name] !== undefined ? settingValues[name] : def
);
const getConfig = jest.fn((_path: string, def: string) => def);
const registerEmailService = jest.fn();

jest.unstable_mockModule('resend', () => ({ Resend }));
jest.unstable_mockModule('../../../../modules/setting/services/setting.js', () => ({
  getSetting
}));
jest.unstable_mockModule('../../../util/getConfig.js', () => ({ getConfig }));
jest.unstable_mockModule('../../emailHelper.js', () => ({
  registerEmailService
}));

const {
  getResendApiKey,
  isEmailConfigured,
  isResendApiKeyPinned,
  resolveFromAddress,
  sendWithResend
} = await import('../../resendEmailService.js');

describe('resendEmailService', () => {
  const originalEnv = process.env.RESEND_API_KEY;

  beforeEach(() => {
    Object.keys(settingValues).forEach((k) => delete settingValues[k]);
    delete process.env.RESEND_API_KEY;
    send.mockResolvedValue({ data: { id: 'msg_1' }, error: null });
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalEnv;
    }
  });

  it('prefers the admin setting over the environment', async () => {
    settingValues.resendApiKey = 're_from_admin';
    settingValues.resendFromEmail = 'Shop <noreply@shop.test>';
    process.env.RESEND_API_KEY = 're_from_env';
    expect(await getResendApiKey()).toBe('re_from_admin');
    expect(await isEmailConfigured()).toBe(true);
  });

  it('falls back to RESEND_API_KEY when the admin field is empty', async () => {
    process.env.RESEND_API_KEY = 're_from_env';
    expect(await getResendApiKey()).toBe('re_from_env');
    expect(isResendApiKeyPinned()).toBe(true);
  });

  it('reports unconfigured when neither source has a key', async () => {
    expect(await getResendApiKey()).toBe('');
    expect(await isEmailConfigured()).toBe(false);
    expect(isResendApiKeyPinned()).toBe(false);
  });

  it('builds From from the dedicated field, then store email', async () => {
    settingValues.resendFromEmail = 'Shop <noreply@shop.test>';
    expect(await resolveFromAddress()).toBe('Shop <noreply@shop.test>');

    delete settingValues.resendFromEmail;
    settingValues.storeEmail = 'help@shop.test';
    settingValues.storeName = 'Bharat Textile';
    expect(await resolveFromAddress()).toBe(
      'Bharat Textile <help@shop.test>'
    );
  });

  it('keeps an already-set from address', async () => {
    expect(await resolveFromAddress('Existing <a@b.c>')).toBe(
      'Existing <a@b.c>'
    );
  });

  it('skips a From value that is only a display name', async () => {
    settingValues.resendFromEmail = 'Bharat Textile';
    settingValues.storeEmail = 'help@shop.test';
    settingValues.storeName = 'Bharat Textile';
    expect(await resolveFromAddress()).toBe(
      'Bharat Textile <help@shop.test>'
    );
  });

  it('skips a Gmail From address because Resend cannot send from it', async () => {
    settingValues.resendApiKey = 're_test';
    settingValues.resendFromEmail =
      'Bharat Textile <vikram@gmail.com>';
    expect(await isEmailConfigured()).toBe(false);
    expect(await resolveFromAddress()).toBe('');
  });

  it('is not configured when the From field has no email address', async () => {
    settingValues.resendApiKey = 're_test';
    settingValues.resendFromEmail = 'Bharat Textile';
    expect(await isEmailConfigured()).toBe(false);
  });

  it('sends through Resend when the key and from address are set', async () => {
    settingValues.resendApiKey = 're_test';
    settingValues.resendFromEmail = 'Shop <noreply@shop.test>';

    await sendWithResend({
      to: 'jane@example.com',
      subject: 'Reset your password',
      template: '<p></p>',
      body: '<p>reset</p>',
      data: {},
      replyTo: 'jane@example.com'
    });

    expect(Resend).toHaveBeenCalledWith('re_test');
    expect(send).toHaveBeenCalledWith({
      from: 'Shop <noreply@shop.test>',
      to: 'jane@example.com',
      subject: 'Reset your password',
      html: '<p>reset</p>',
      replyTo: 'jane@example.com'
    });
  });

  it('throws when the API key is missing', async () => {
    await expect(
      sendWithResend({
        to: 'jane@example.com',
        subject: 'Hi',
        template: '<p></p>',
        body: '<p>hi</p>',
        data: {}
      })
    ).rejects.toThrow(/Resend API key is not set/);
    expect(send).not.toHaveBeenCalled();
  });
});
