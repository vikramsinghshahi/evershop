import { getConfig } from '../../../../../lib/util/getConfig.js';

function readSetting(setting, name: string) {
  return setting.find((row) => row.name === name);
}

export default {
  Setting: {
    razorpayPaymentStatus: (setting) => {
      const configured = getConfig('system.razorpay', {});
      if (configured?.status) {
        return parseInt(String(configured.status), 10);
      }
      const row = readSetting(setting, 'razorpayPaymentStatus');
      if (row) {
        return parseInt(row.value, 10);
      }
      return 0;
    },
    razorpayDisplayName: (setting) => {
      const row = readSetting(setting, 'razorpayDisplayName');
      if (row) {
        return row.value;
      }
      return 'Razorpay';
    },
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
    }
  }
};
