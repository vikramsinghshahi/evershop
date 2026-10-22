import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

jest.unstable_mockModule('../../../../../../../lib/mail/resendEmailService.js', () => ({
  isResendApiKeyPinned: () => Boolean((process.env.RESEND_API_KEY || '').trim())
}));

const resolvers = (await import('../../EmailSetting.admin.resolvers.js')).default
  .Setting as Record<string, (...args: any[]) => unknown>;

const row = (name: string, value: string) => ({ name, value });
const admin = { user: { uuid: 'admin' } };
const anonymous = {};

describe('EmailSetting admin resolvers', () => {
  const originalEnv = process.env.RESEND_API_KEY;

  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalEnv;
    }
  });

  it('returns the saved API key only to an authenticated admin', () => {
    const setting = [row('resendApiKey', 're_secret')];
    expect(resolvers.resendApiKey(setting, {}, admin)).toBe('re_secret');
    expect(resolvers.resendApiKey(setting, {}, anonymous)).toBeNull();
  });

  it('masks the key when RESEND_API_KEY is set in the environment', () => {
    process.env.RESEND_API_KEY = 're_from_env_value';
    const setting = [row('resendApiKey', 're_db')];
    const value = resolvers.resendApiKey(setting, {}, admin) as string;
    expect(value.startsWith('re_fr')).toBe(true);
    expect(value.includes('re_from_env_value')).toBe(false);
    expect(resolvers.resendApiKeyPinned([], {}, admin)).toBe(true);
  });

  it('returns the From address without a user gate', () => {
    expect(
      resolvers.resendFromEmail([
        row('resendFromEmail', 'Shop <noreply@shop.test>')
      ])
    ).toBe('Shop <noreply@shop.test>');
  });
});
