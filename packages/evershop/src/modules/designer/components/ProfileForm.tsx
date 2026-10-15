import { Button } from '@components/common/ui/Button.js';
import { toast } from '@components/common/ui/Sonner.js';
import React from 'react';
import { slugify } from '../services/designerRules.js';
import { designerApi, fieldClass, labelClass } from './designerApi.js';
import { type DesignerTerms, SellerAgreement } from './SellerAgreement.js';

export interface OwnProfile {
  uuid: string;
  displayName: string;
  slug: string;
  studioName: string | null;
  bio: string | null;
  status: 'pending' | 'verified' | 'suspended';
  statusLabel: string;
  statusNote: string | null;
  agreementCurrent: boolean;
  agreementAcceptedAt: string | null;
  payoutMethod: 'paypal' | 'bank' | null;
  payoutPaypalEmail: string | null;
  payoutBankName: string | null;
  payoutBankAccount: string;
  payoutBankHolder: string | null;
  payoutBankIfsc: string | null;
  gstin: string | null;
  pan: string | null;
  commissionRate: number | null;
  url: string | null;
}

interface ProfileFormProps {
  profile: OwnProfile | null;
  defaultName: string;
  api: string;
  terms: DesignerTerms;
  agreementVersion: string;
  onSaved: (profile: OwnProfile) => void;
}

type PayoutChoice = '' | 'paypal' | 'bank';

export function ProfileForm({
  profile,
  defaultName,
  api,
  terms,
  agreementVersion,
  onSaved
}: ProfileFormProps) {
  const [displayName, setDisplayName] = React.useState(profile?.displayName ?? defaultName);
  const [slug, setSlug] = React.useState(profile?.slug ?? slugify(defaultName));
  const [slugTouched, setSlugTouched] = React.useState(Boolean(profile));
  const [studioName, setStudioName] = React.useState(profile?.studioName ?? '');
  const [bio, setBio] = React.useState(profile?.bio ?? '');
  const [payout, setPayout] = React.useState<PayoutChoice>(profile?.payoutMethod ?? '');
  const [paypal, setPaypal] = React.useState(profile?.payoutPaypalEmail ?? '');
  const [holder, setHolder] = React.useState(profile?.payoutBankHolder ?? '');
  const [account, setAccount] = React.useState('');
  const [ifsc, setIfsc] = React.useState(profile?.payoutBankIfsc ?? '');
  const [bankName, setBankName] = React.useState(profile?.payoutBankName ?? '');
  const [gstin, setGstin] = React.useState(profile?.gstin ?? '');
  const [pan, setPan] = React.useState(profile?.pan ?? '');
  const [accept, setAccept] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const needsAgreement = !profile || !profile.agreementCurrent;
  const savedBank = profile?.payoutMethod === 'bank' && Boolean(profile.payoutBankAccount);

  const payoutPayload = (): Record<string, unknown> => {
    if (payout === 'paypal') {
      return { payoutMethod: 'paypal', payoutPaypalEmail: paypal };
    }
    if (payout === 'bank') {
      // A blank account number means "keep the saved bank details".
      if (savedBank && !account.trim()) {
        return { payoutMethod: null };
      }
      return {
        payoutMethod: 'bank',
        payoutBank: { accountName: holder, accountNumber: account, ifsc, bankName }
      };
    }
    return { payoutMethod: null };
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (needsAgreement && !accept) {
      toast.error('Read and accept the Seller Agreement to continue.');
      return;
    }
    setSaving(true);
    try {
      const saved = await designerApi<OwnProfile>(api, 'POST', {
        displayName,
        slug,
        studioName,
        bio,
        gstin,
        pan,
        acceptAgreement: accept,
        ...payoutPayload()
      });
      toast.success(profile ? 'Profile saved.' : 'Welcome! Your designer profile is set up.');
      setAccount('');
      onSaved(saved);
    } catch (failure) {
      toast.error((failure as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="designer-profile-form space-y-5" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="designer-name">
            Designer name
          </label>
          <input
            id="designer-name"
            className={fieldClass}
            value={displayName}
            maxLength={80}
            required
            onChange={(event) => {
              setDisplayName(event.target.value);
              if (!slugTouched) {
                setSlug(slugify(event.target.value));
              }
            }}
          />
          <p className="mt-1 text-xs text-muted-foreground">Shown on every design you sell.</p>
        </div>
        <div>
          <label className={labelClass} htmlFor="designer-slug">
            Profile address
          </label>
          <div className="flex items-center rounded-md border border-border bg-background pl-3 text-sm">
            <span className="text-muted-foreground">/designer/</span>
            <input
              id="designer-slug"
              className="w-full bg-transparent py-2 pr-3 outline-none"
              value={slug}
              maxLength={60}
              required
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
              }}
              onBlur={() => setSlug(slugify(slug))}
            />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="designer-studio">
            Studio or brand (optional)
          </label>
          <input
            id="designer-studio"
            className={fieldClass}
            value={studioName}
            maxLength={120}
            onChange={(event) => setStudioName(event.target.value)}
          />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="designer-bio">
          About you (optional)
        </label>
        <textarea
          id="designer-bio"
          className={fieldClass}
          rows={3}
          maxLength={1500}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
        />
      </div>

      <fieldset className="space-y-3 rounded-md border border-border p-4">
        <legend className="px-1 text-sm font-medium">Payout details</legend>
        <p className="text-xs text-muted-foreground">
          Needed before your first payout. You can add them later.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          {(
            [
              ['', 'Add later'],
              ['paypal', 'PayPal'],
              ['bank', 'Indian bank transfer']
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="payout-method"
                checked={payout === value}
                onChange={() => setPayout(value)}
              />
              {label}
            </label>
          ))}
        </div>
        {payout === '' && profile?.payoutMethod && (
          <p className="text-xs text-muted-foreground">Your saved payout details are kept.</p>
        )}
        {payout === 'paypal' && (
          <div>
            <label className={labelClass} htmlFor="designer-paypal">
              PayPal email
            </label>
            <input
              id="designer-paypal"
              type="email"
              className={fieldClass}
              value={paypal}
              required
              onChange={(event) => setPaypal(event.target.value)}
            />
          </div>
        )}
        {payout === 'bank' && (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="designer-holder">
                Account holder
              </label>
              <input
                id="designer-holder"
                className={fieldClass}
                value={holder}
                required={!savedBank}
                onChange={(event) => setHolder(event.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="designer-account">
                Account number
              </label>
              <input
                id="designer-account"
                className={fieldClass}
                inputMode="numeric"
                autoComplete="off"
                value={account}
                placeholder={savedBank ? `${profile?.payoutBankAccount} (leave blank to keep)` : ''}
                required={!savedBank}
                onChange={(event) => setAccount(event.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="designer-ifsc">
                IFSC
              </label>
              <input
                id="designer-ifsc"
                className={fieldClass}
                value={ifsc}
                maxLength={11}
                required={!savedBank}
                onChange={(event) => setIfsc(event.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="designer-bank">
                Bank name
              </label>
              <input
                id="designer-bank"
                className={fieldClass}
                value={bankName}
                onChange={(event) => setBankName(event.target.value)}
              />
            </div>
            {savedBank && (
              <p className="text-xs text-muted-foreground md:col-span-2">
                To change the account, enter the new number together with holder and IFSC.
              </p>
            )}
          </div>
        )}
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="designer-gstin">
              GSTIN (optional)
            </label>
            <input
              id="designer-gstin"
              className={fieldClass}
              value={gstin}
              maxLength={15}
              onChange={(event) => setGstin(event.target.value.toUpperCase())}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="designer-pan">
              PAN (optional)
            </label>
            <input
              id="designer-pan"
              className={fieldClass}
              value={pan}
              maxLength={10}
              onChange={(event) => setPan(event.target.value.toUpperCase())}
            />
          </div>
        </div>
      </fieldset>

      {needsAgreement && (
        <div className="space-y-3 rounded-md border border-border p-4">
          {profile && (
            <p className="text-sm font-medium">
              The Seller Agreement has changed. Accept the new version to keep submitting designs.
            </p>
          )}
          <SellerAgreement terms={terms} version={agreementVersion} />
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={accept}
              onChange={(event) => setAccept(event.target.checked)}
            />
            I have read and accept the Seller Agreement.
          </label>
        </div>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? 'Saving…' : profile ? 'Save profile' : 'Create designer profile'}
      </Button>
    </form>
  );
}
