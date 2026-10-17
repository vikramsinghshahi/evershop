import { Button } from '@components/common/ui/Button.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@components/common/ui/Dialog.js';
import { AccountHeader } from '@components/frontStore/customer/AccountHeader.js';
import { AccountNav } from '@components/frontStore/customer/AccountNav.js';
import React from 'react';
import type { DesignOptions } from '../../../components/DesignFields.js';
import { DesignList, type OwnDesign } from '../../../components/DesignList.js';
import { DesignUpload } from '../../../components/DesignUpload.js';
import { type OwnProfile, ProfileForm } from '../../../components/ProfileForm.js';
import type { DesignerTerms } from '../../../components/SellerAgreement.js';
import {
  type WalletEntry,
  WalletPanel,
  type WalletSummary
} from '../../../components/WalletPanel.js';

interface Workspace {
  profile: OwnProfile | null;
  designs: OwnDesign[];
  wallet: WalletSummary | null;
  entries: WalletEntry[];
  options: DesignOptions & { agreementVersion: string; terms: DesignerTerms };
  apis: { saveProfile: string; upload: string; catalog: string };
  customerName: string;
}

type Tab = 'designs' | 'wallet' | 'profile';

function StatusBanner({ profile }: { profile: OwnProfile }) {
  if (profile.status === 'suspended') {
    return (
      <div className="rounded-md bg-red-50 p-3 text-sm text-red-900">
        <strong>Your designer account is suspended.</strong> Your designs are hidden from shoppers
        and you cannot send new ones for review.
        {profile.statusNote && <span> Reason: {profile.statusNote}</span>} Contact us if you think
        this is a mistake.
      </div>
    );
  }
  if (profile.status === 'pending') {
    return (
      <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
        <strong>We are checking your profile.</strong> You can upload designs and send them for
        review now. They go live once your account is verified and each design is approved.
      </div>
    );
  }
  return (
    <div className="rounded-md bg-green-50 p-3 text-sm text-green-900">
      <strong>Verified designer.</strong> Approved designs appear in the design library and in the
      fabric print picker.
      {profile.url && (
        <>
          {' '}
          <a className="underline" href={profile.url}>
            View your public page
          </a>
        </>
      )}
    </div>
  );
}

export default function DesignerDashboard({
  designerWorkspace
}: {
  designerWorkspace: Workspace | null;
}) {
  const workspace = designerWorkspace;
  const [profile, setProfile] = React.useState<OwnProfile | null>(workspace?.profile ?? null);
  const [designs, setDesigns] = React.useState<OwnDesign[]>(workspace?.designs ?? []);
  const [tab, setTab] = React.useState<Tab>('designs');
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [uploadKey, setUploadKey] = React.useState(0);

  React.useEffect(() => {
    const requested = window.location.hash.replace('#', '');
    if (requested === 'wallet' || requested === 'profile' || requested === 'designs') {
      setTab(requested);
    }
  }, []);

  const openUpload = () => {
    setUploadKey((key) => key + 1);
    setUploadOpen(true);
  };

  if (!workspace) {
    return (
      <div className="mx-auto max-w-2xl py-10 text-center text-sm">
        <a className="underline" href="/account/login?redirect=/account/designer">
          Sign in to open your designer dashboard
        </a>
      </div>
    );
  }

  const { options, apis } = workspace;
  const canSubmit = Boolean(profile?.agreementCurrent) && profile?.status !== 'suspended';

  const switchTab = (next: Tab) => {
    setTab(next);
    window.history.replaceState(null, '', `#${next}`);
  };

  return (
    <div className="account designer-dashboard mx-auto max-w-4xl py-10">
      <AccountHeader />
      <AccountNav active="designer" />
      <div className="mt-8 space-y-6">
        {!profile ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Sell your designs</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload your prints. Once approved, shoppers can choose them when they order printed
                fabric, and you earn {options.terms.rate}% of each sale in your wallet.
              </p>
            </div>
            <ProfileForm
              profile={null}
              defaultName={workspace.customerName}
              api={apis.saveProfile}
              terms={options.terms}
              agreementVersion={options.agreementVersion}
              onSaved={(saved) => {
                setProfile(saved);
                switchTab('designs');
              }}
            />
          </section>
        ) : (
          <>
            <StatusBanner profile={profile} />
            {!profile.agreementCurrent && (
              <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                The Seller Agreement has been updated.{' '}
                <button type="button" className="underline" onClick={() => switchTab('profile')}>
                  Review and accept it
                </button>{' '}
                to send designs for review.
              </div>
            )}
            <div className="flex gap-4 border-b border-border text-sm" role="tablist">
              {(
                [
                  ['designs', `My designs (${designs.length})`],
                  ['wallet', 'Wallet'],
                  ['profile', 'Profile & payouts']
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  className={`-mb-px border-b-2 pb-2 ${
                    tab === id
                      ? 'border-foreground font-medium'
                      : 'border-transparent text-muted-foreground'
                  }`}
                  onClick={() => switchTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            {tab === 'designs' && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-medium">Your designs</h3>
                    <p className="text-sm text-muted-foreground">
                      {designs.length === 0
                        ? 'No designs yet. Upload one to get started.'
                        : `${designs.length} design${designs.length === 1 ? '' : 's'}`}
                    </p>
                  </div>
                  {profile.status !== 'suspended' && (
                    <Button
                      type="button"
                      size="sm"
                      className="cursor-pointer"
                      onClick={openUpload}
                    >
                      Upload design
                    </Button>
                  )}
                </div>
                <DesignList
                  designs={designs}
                  base={apis.upload}
                  options={options}
                  canSubmit={canSubmit}
                  onChange={(updated) =>
                    setDesigns((list) =>
                      list.map((design) => (design.uuid === updated.uuid ? updated : design))
                    )
                  }
                  onDeleted={(uuid) =>
                    setDesigns((list) => list.filter((design) => design.uuid !== uuid))
                  }
                />
                {profile.status !== 'suspended' && (
                  <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                    <DialogContent className="sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Upload a design</DialogTitle>
                        <DialogDescription>
                          Add your file and details, then save. You can send it for review now or
                          keep it as a draft.
                        </DialogDescription>
                      </DialogHeader>
                      <DesignUpload
                        key={uploadKey}
                        api={apis.upload}
                        options={options}
                        canSubmit={canSubmit}
                        onUploaded={(design) => {
                          setDesigns((list) => [design, ...list]);
                          setUploadOpen(false);
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                )}
              </section>
            )}
            {tab === 'wallet' && (
              <WalletPanel
                summary={
                  workspace.wallet ?? {
                    pending: 0,
                    available: 0,
                    paidOut: 0,
                    lifetime: 0,
                    minPayout: options.terms.minPayout
                  }
                }
                entries={workspace.entries}
                holdDays={options.terms.holdDays}
                hasPayoutMethod={Boolean(profile.payoutMethod)}
              />
            )}
            {tab === 'profile' && (
              <ProfileForm
                key={`${profile.uuid}-${profile.agreementCurrent}`}
                profile={profile}
                defaultName={workspace.customerName}
                api={apis.saveProfile}
                terms={options.terms}
                agreementVersion={options.agreementVersion}
                onSaved={setProfile}
              />
            )}
          </>
        )}
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
    designerWorkspace
  }
`;
