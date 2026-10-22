import {
  isResendApiKeyPinned
} from '../../../../../lib/mail/resendEmailService.js';
import { getEnv } from '../../../../../lib/util/getEnv.js';

type SettingRow = { name: string; value: string };
type GraphQLContext = { user?: unknown };

const mask = (value: string): string =>
  `${value.slice(0, 5)}*******************************`;

const findSetting = (
  setting: SettingRow[],
  name: string
): string | undefined => {
  const row = setting.find((s) => s.name === name);
  return row === undefined || row.value === '' ? undefined : row.value;
};

export default {
  Setting: {
    resendApiKeyPinned: () => isResendApiKeyPinned(),
    resendApiKey: (setting: SettingRow[], _: unknown, context: GraphQLContext) => {
      if (!context.user) {
        return null;
      }
      const envKey = (getEnv('RESEND_API_KEY', '') || '').trim();
      if (envKey) {
        return mask(envKey);
      }
      return findSetting(setting, 'resendApiKey') ?? null;
    },
    resendFromEmail: (setting: SettingRow[]) =>
      findSetting(setting, 'resendFromEmail') ?? null
  }
};
