import { InputField } from '@components/common/form/InputField.js';
import { classifyFromAddress } from '../../../../../lib/mail/fromAddress.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';

interface EmailSettingProps {
  setting: {
    resendApiKey?: string | null;
    resendApiKeyPinned?: boolean;
    resendFromEmail?: string | null;
  };
}

export default function EmailSetting({
  setting: { resendApiKey, resendApiKeyPinned, resendFromEmail }
}: EmailSettingProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{_('Email (Resend)')}</CardTitle>
        <CardDescription>
          {_(
            'Outgoing mail for password reset, order confirmation, welcome, and the contact form. Get a free API key at resend.com. For testing, the onboarding@resend.dev sender can only deliver to the email you signed up with. For customers, verify your domain and send from an address on that domain.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>{_('API key')}</h4>
          </div>
          <div className="col-span-2">
            {resendApiKeyPinned ? (
              <div className="text-sm border border-border rounded-md px-3 py-2 bg-muted/30 text-muted-foreground">
                <span className="break-all">{resendApiKey || '—'}</span>
                <p className="text-xs mt-1">
                  {_(
                    'Managed by the RESEND_API_KEY environment variable. Remove it from the environment to edit this field here.'
                  )}
                </p>
              </div>
            ) : (
              <InputField
                name="resendApiKey"
                type="password"
                autoComplete="off"
                placeholder="re_xxxxxxxx"
                defaultValue={resendApiKey || ''}
                helperText={_(
                  'Paste the key from the Resend dashboard. Saved keys take effect immediately — no server restart.'
                )}
              />
            )}
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 items-center flex">
            <h4>{_('From address')}</h4>
          </div>
          <div className="col-span-2">
            <InputField
              name="resendFromEmail"
              placeholder="Bharat Textile <beth.t@example.com>"
              defaultValue={resendFromEmail || ''}
              validation={{
                validate: (value: string) => {
                  const issue = classifyFromAddress(String(value || ''));
                  if (issue === 'invalid') {
                    return _(
                      'Use email@domain.com or Name <email@domain.com>. A name by itself is not enough.'
                    );
                  }
                  if (issue === 'blocked') {
                    return _(
                      'Gmail/Yahoo/Outlook cannot be the From address. Use beth.t@example.com for testing, or an address on a domain you verified at resend.com/domains.'
                    );
                  }
                  return true;
                }
              }}
              helperText={_(
                'Required by Resend. For testing use Bharat Textile <beth.t@example.com> — that sender only delivers to the email you signed up with at Resend. For customers, verify your domain and send from an address on it.'
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const layout = {
  areaId: 'systemSetting',
  sortOrder: 5
};

export const query = `
  query Query {
    setting {
      resendApiKey
      resendApiKeyPinned
      resendFromEmail
    }
  }
`;
