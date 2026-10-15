import { Card, CardContent } from '@components/common/ui/Card.js';
import { toast } from '@components/common/ui/Sonner.js';
import { CustomerRegistrationForm } from '@components/frontStore/customer/RegistrationForm.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';

interface RegisterPageProps {
  homeUrl: string;
  loginUrl: string;
  designerDashboardUrl: string;
}
export default function RegisterPage({
  homeUrl,
  loginUrl,
  designerDashboardUrl
}: RegisterPageProps) {
  // `?as=designer` comes from "Sell your designs" links.
  const [role, setRole] = React.useState<'customer' | 'designer'>('customer');
  React.useEffect(() => {
    if (new URLSearchParams(window.location.search).get('as') === 'designer') {
      setRole('designer');
    }
  }, []);
  const designer = role === 'designer';
  return (
    <div className="register__form flex flex-col items-center py-10 md:px-4">
      <div className="w-full max-w-md">
        <Card className="rounded-lg border border-border py-8 shadow-none ring-0">
          <CardContent className="px-8">
            <div className="mb-6" role="radiogroup" aria-label={_('I am a')}>
              <div className="mb-2 text-sm font-medium">{_('I am a')}</div>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ['customer', _('Customer'), _('Buy fabric and prints')],
                    ['designer', _('Designer'), _('Sell my designs and earn commission')]
                  ] as const
                ).map(([id, label, hint]) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={role === id}
                    className={`rounded-md border px-3 py-2 text-left ${
                      role === id ? 'border-foreground' : 'border-border text-muted-foreground'
                    }`}
                    onClick={() => setRole(id)}
                  >
                    <span className="block text-sm font-medium text-foreground">{label}</span>
                    <span className="block text-xs">{hint}</span>
                  </button>
                ))}
              </div>
            </div>
            <CustomerRegistrationForm
              title={designer ? _('Create designer account') : _('Create account')}
              subtitle={
                designer
                  ? _('Next you will set up your designer profile and accept the Seller Agreement')
                  : _('Join us for exclusive offers and order tracking')
              }
              redirectUrl={designer ? designerDashboardUrl : homeUrl}
              onError={(error) => {
                toast.error(error);
              }}
              className="w-full"
            />
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {_('Already have an account?')}{' '}
          <a
            className="font-medium text-foreground hover:underline"
            href={loginUrl}
          >
            {_('Sign in')}
          </a>
        </div>
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    homeUrl: url(routeId: "homepage")
    loginUrl: url(routeId: "login")
    designerDashboardUrl: url(routeId: "designerDashboard")
  }
`;
