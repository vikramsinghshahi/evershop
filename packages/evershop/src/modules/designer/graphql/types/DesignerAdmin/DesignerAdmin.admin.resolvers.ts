import { buildUrl } from '../../../../../lib/router/buildUrl.js';
import { getSetting } from '../../../../setting/services/setting.js';
import { readMinPayout } from '../../../services/commission.js';
import { money } from '../../../services/db.js';
import { DESIGN_STATUSES, DESIGNER_STATUSES, maskAccount } from '../../../services/designerRules.js';
import { adminListDesigns } from '../../../services/designs.js';
import { payoutBalances, recentPayouts } from '../../../services/ledger.js';
import { ownProfile, reviewDesign } from '../../../services/present.js';
import { adminListProfiles } from '../../../services/profiles.js';

function status(value: unknown, allowed: readonly string[]): string | null {
  return typeof value === 'string' && allowed.includes(value) ? value : null;
}

export default {
  Query: {
    adminDesigners: async (_root, args) => {
      const profiles = await adminListProfiles(status(args.status, DESIGNER_STATUSES));
      return profiles.map((profile) => ({
        ...ownProfile(profile),
        email: profile.email,
        customerActive: profile.customer_status === 1,
        designCount: profile.design_count,
        liveCount: profile.live_count,
        pendingCount: profile.pending_count,
        createdAt: new Date(profile.created_at).toISOString(),
        updateApi: buildUrl('adminUpdateDesigner', { id: profile.uuid })
      }));
    },
    adminDesignReview: async (_root, args) => {
      const designs = await adminListDesigns(status(args.status, DESIGN_STATUSES));
      return designs.map((design) => ({
        ...reviewDesign(design),
        reviewApi: buildUrl('adminReviewDesign', { id: design.uuid })
      }));
    },
    adminDesignerPayouts: async () => {
      const [balances, payouts, minPayout] = await Promise.all([
        payoutBalances(),
        recentPayouts(),
        getSetting('designerMinPayout', '500')
      ]);
      return {
        minPayout: readMinPayout(minPayout),
        recordApi: buildUrl('adminRecordPayout'),
        balances: balances.map((row) => ({
          uuid: row.uuid,
          name: row.display_name,
          status: row.status,
          email: row.email,
          payoutMethod: row.payout_method,
          payoutTo:
            row.payout_method === 'paypal'
              ? row.payout_paypal_email
              : row.payout_method === 'bank' && row.payout_bank
                ? `${row.payout_bank.accountName} · ${row.payout_bank.bankName || 'Bank'} ${maskAccount(
                    row.payout_bank.accountNumber
                  )} · ${row.payout_bank.ifsc}`
                : null,
          payoutBank: row.payout_method === 'bank' ? row.payout_bank : null,
          pending: money(row.pending),
          available: money(row.available),
          paidOut: money(row.paid_out),
          lastPayoutAt: row.last_payout_at ? new Date(row.last_payout_at).toISOString() : null
        })),
        payouts: payouts.map((payout) => ({
          uuid: payout.uuid,
          designer: payout.display_name,
          amount: money(payout.amount),
          method: payout.method,
          reference: payout.reference,
          note: payout.note,
          paidBy: payout.paid_by,
          createdAt: new Date(payout.created_at).toISOString()
        }))
      };
    }
  }
};
