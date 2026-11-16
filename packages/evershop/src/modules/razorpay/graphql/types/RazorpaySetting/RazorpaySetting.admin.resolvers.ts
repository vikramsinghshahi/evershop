import { getConfig } from '../../../../../lib/util/getConfig.js';

function readSetting(setting, name: string) {
  return setting.find((row) => row.name === name);
}

function secretFromConfig(value: string | undefined) {
  if (!value) {
    return null;
  }
  return `${value.substr(0, 5)}*******************************`;
}

export default {
  Setting: {
    razorpayKeyId: (setting) => {
      const configured = getConfig('system.razorpay', {});
      if (configured?.keyId) {
        return configured.keyId;
      }
      const row = readSetting(setting, 'razorpayKeyId');
      if (row) {
        return row.value;
      }
      return null;
    },
    razorpayKeySecret: (setting, _, { user }) => {
      const configured = getConfig('system.razorpay', {});
      const masked = secretFromConfig(configured?.keySecret);
      if (masked) {
        return masked;
      }
      if (!user) {
        return null;
      }
      const row = readSetting(setting, 'razorpayKeySecret');
      return row ? row.value : null;
    },
    razorpayWebhookSecret: (setting, _, { user }) => {
      const configured = getConfig('system.razorpay', {});
      const masked = secretFromConfig(configured?.webhookSecret);
      if (masked) {
        return masked;
      }
      if (!user) {
        return null;
      }
      const row = readSetting(setting, 'razorpayWebhookSecret');
      return row ? row.value : null;
    }
  }
};
