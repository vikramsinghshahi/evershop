import { InputField } from '@components/common/form/InputField.js';
import { ToggleField } from '@components/common/form/ToggleField.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';

interface RazorpaySettingProps {
  setting: {
    razorpayPaymentStatus: true | false | 0 | 1;
    razorpayDisplayName: string;
    razorpayKeyId: string;
    razorpayKeySecret: string;
    razorpayWebhookSecret: string;
  };
}

export default function RazorpaySetting({
  setting: {
    razorpayPaymentStatus,
    razorpayDisplayName,
    razorpayKeyId,
    razorpayKeySecret,
    razorpayWebhookSecret
  }
}: RazorpaySettingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{_('Razorpay Payment')}</CardTitle>
        <CardDescription>
          {_('Configure your Razorpay payment gateway settings')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>{_('Enable?')}</h4>
          </div>
          <div className="col-span-2">
            <ToggleField
              name="razorpayPaymentStatus"
              defaultValue={razorpayPaymentStatus}
              trueValue={1}
              falseValue={0}
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>{_('Dislay Name')}</h4>
          </div>
          <div className="col-span-2">
            <InputField
              name="razorpayDisplayName"
              placeholder={_('Display Name')}
              defaultValue={razorpayDisplayName || ''}
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>{_('Key ID')}</h4>
          </div>
          <div className="col-span-2">
            <InputField
              name="razorpayKeyId"
              placeholder={_('rzp_test_…')}
              defaultValue={razorpayKeyId || ''}
              helperText={_(
                'Razorpay Dashboard → Account & Settings → API Keys, with Test Mode on. A test key starts with rzp_test_.'
              )}
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>{_('Key Secret')}</h4>
          </div>
          <div className="col-span-2">
            <InputField
              name="razorpayKeySecret"
              placeholder={_('Key Secret')}
              defaultValue={razorpayKeySecret || ''}
              helperText={_(
                'Shown once when the key is generated. Use the test secret while Test Mode is on.'
              )}
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>{_('Webhook Secret')}</h4>
          </div>
          <div className="col-span-2">
            <InputField
              name="razorpayWebhookSecret"
              placeholder={_('Webhook Secret')}
              defaultValue={razorpayWebhookSecret || ''}
              helperText={_(
                'Webhook URL: https://yourdomain.com/api/razorpay/webhook. Events: payment.captured, payment.failed, refund.processed. A local checkout still marks the order paid without this.'
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const layout = {
  areaId: 'paymentSetting',
  sortOrder: 12
};

export const query = `
  query Query {
    setting {
      razorpayPaymentStatus
      razorpayDisplayName
      razorpayKeyId
      razorpayKeySecret
      razorpayWebhookSecret
    }
  }
`;
