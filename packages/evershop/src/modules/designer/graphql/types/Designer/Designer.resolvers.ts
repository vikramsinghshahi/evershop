import { buildUrl } from '../../../../../lib/router/buildUrl.js';
import { getSetting } from '../../../../setting/services/setting.js';
import {
  effectiveRate,
  readBonusTiers,
  readHoldDays,
  readMinPayout
} from '../../../services/commission.js';
import {
  AGREEMENT_VERSION,
  DESIGN_CATEGORIES,
  DESIGN_COLORS,
  DESIGN_FILE_TYPES,
  DESIGN_MAX_FILE_MB,
  DESIGN_MIN_SIDE_PX,
  REPEAT_TYPES
} from '../../../services/designerRules.js';
import { listLiveDesigns, liveDesigners, myDesigns } from '../../../services/designs.js';
import { walletEntries, walletSummary } from '../../../services/ledger.js';
import { ownDesign, ownProfile, publicDesign, walletEntry } from '../../../services/present.js';
import { printFabrics } from '../../../services/printFabrics.js';
import { profileByCustomer, publicProfileBySlug } from '../../../services/profiles.js';

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 80) : null;
}

export default {
  Query: {
    designerNav: async (_root, _args, { customer }) => {
      if (!customer?.customer_id) {
        return null;
      }
      const studioUrl = buildUrl('designerDashboard');
      const profile = await profileByCustomer(customer.customer_id);
      if (!profile) {
        return {
          hasProfile: false,
          status: null,
          label: 'Sell designs',
          studioUrl
        };
      }
      return {
        hasProfile: true,
        status: profile.status,
        label: 'Designer studio',
        studioUrl,
        displayName: profile.display_name
      };
    },
    designerWorkspace: async (_root, _args, { customer }) => {
      if (!customer?.customer_id) {
        return null;
      }
      const profile = await profileByCustomer(customer.customer_id);
      const [rate, tiers, holdDays, minPayout] = await Promise.all([
        getSetting('designerCommissionRate', '10'),
        getSetting('designerBonusTiers', ''),
        getSetting('designerHoldDays', '14'),
        getSetting('designerMinPayout', '500')
      ]);
      const terms = {
        rate: effectiveRate(profile?.commission_rate ?? null, rate),
        bonusTiers: readBonusTiers(tiers),
        holdDays: readHoldDays(holdDays),
        minPayout: readMinPayout(minPayout)
      };
      const options = {
        categories: DESIGN_CATEGORIES,
        colors: DESIGN_COLORS,
        repeatTypes: REPEAT_TYPES,
        fileTypes: DESIGN_FILE_TYPES,
        maxFileMb: DESIGN_MAX_FILE_MB,
        minSidePx: DESIGN_MIN_SIDE_PX,
        agreementVersion: AGREEMENT_VERSION,
        terms
      };
      const apis = {
        saveProfile: buildUrl('saveDesignerProfile'),
        upload: buildUrl('uploadDesignerDesign'),
        catalog: buildUrl('designCatalog')
      };
      if (!profile) {
        return {
          profile: null,
          designs: [],
          wallet: null,
          entries: [],
          options,
          apis,
          customerName: customer.full_name ?? ''
        };
      }
      const [designs, summary, entries] = await Promise.all([
        myDesigns(profile.designer_profile_id),
        walletSummary(profile.designer_profile_id),
        walletEntries(profile.designer_profile_id)
      ]);
      return {
        profile: ownProfile(profile),
        designs: designs.map((design) => ({
          ...ownDesign(design),
          updateApi: buildUrl('updateDesignerDesign', { id: design.uuid }),
          actionApi: buildUrl('designerDesignAction', { id: design.uuid }),
          deleteApi: buildUrl('deleteDesignerDesign', { id: design.uuid })
        })),
        wallet: summary,
        entries: entries.map(walletEntry),
        options,
        apis,
        customerName: customer.full_name ?? ''
      };
    },
    designGallery: async (_root, args) => {
      const filters = {
        category: text(args.category),
        color: text(args.color),
        designer: text(args.designer),
        q: text(args.q),
        sort: text(args.sort) === 'best' ? 'best' : null
      };
      const result = await listLiveDesigns({
        ...filters,
        page: args.page ?? 1,
        limit: 24
      });
      return {
        items: result.items.map(publicDesign),
        total: result.total,
        page: result.page,
        limit: result.limit,
        filters
      };
    },
    designerPublicProfile: async (_root, { slug }) => {
      const profile = await publicProfileBySlug(String(slug || '').toLowerCase());
      if (!profile) {
        return null;
      }
      return {
        displayName: profile.display_name,
        slug: profile.slug,
        studioName: profile.studio_name,
        bio: profile.bio,
        since: profile.verified_at ? new Date(profile.verified_at).toISOString() : null
      };
    },
    printFabrics: () => printFabrics(),
    designFilterOptions: async () => {
      const designers = await liveDesigners();
      return {
        categories: DESIGN_CATEGORIES,
        colors: DESIGN_COLORS,
        designers: designers.map((designer) => ({
          slug: designer.slug,
          name: designer.display_name,
          count: designer.count
        }))
      };
    }
  }
};
