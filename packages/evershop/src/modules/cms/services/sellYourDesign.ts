export const SELL_YOUR_DESIGN_PATH = '/sell-your-design';
export const SELL_YOUR_DESIGN_LABEL = 'Sell your design';
export const SELL_YOUR_DESIGN_MENU_ID = 'b8d4f2a1-6c39-4e70-9a12-7f3c5d8e1b40';
/** Shipped WebP. The design-folder original is not served. */
export const SELL_YOUR_DESIGN_BANNER = '/sell-your-design/banner.webp';
export const SELL_YOUR_DESIGN_START = '/account/designer';

export interface SellYourDesignStep {
  id: string;
  title: string;
  text: string;
}

export const SELL_YOUR_DESIGN_STEPS: readonly SellYourDesignStep[] = [
  {
    id: 'register',
    title: '1. Register',
    text: 'Sign up as a designer on our platform.'
  },
  {
    id: 'upload',
    title: '2. Upload your design',
    text: 'Add your design with proper details and follow the guidelines.'
  },
  {
    id: 'select',
    title: '3. Customer selects',
    text: 'When a customer chooses your design, the order is placed.'
  },
  {
    id: 'earn',
    title: '4. Earn & get paid',
    text: 'You receive 10% commission, which is credited to your wallet after the parcel is delivered.'
  }
];

export interface SellYourDesignGuide {
  id: string;
  title: string;
  text: string;
}

export const SELL_YOUR_DESIGN_GUIDES: readonly SellYourDesignGuide[] = [
  { id: 'size', title: 'File size', text: 'Maximum 2 MB per design.' },
  { id: 'formats', title: 'Formats accepted', text: 'JPEG, PNG or TIF.' },
  {
    id: 'quality',
    title: 'Design quality',
    text: 'Design must be perfect and clear. (As per the original design)'
  },
  {
    id: 'original',
    title: 'Original design',
    text: 'You must have the rights to sell the design and it should be your own work.'
  },
  {
    id: 'print',
    title: 'Print ready',
    text: 'Ensure correct colours, resolution and clean background (if required).'
  }
];

export interface SellYourDesignTerm {
  id: string;
  title: string;
  text: string;
}

export const SELL_YOUR_DESIGN_TERMS: readonly SellYourDesignTerm[] = [
  {
    id: 'eligibility',
    title: 'Eligibility',
    text: 'Only registered designers are eligible to participate in this program.'
  },
  {
    id: 'ownership',
    title: 'Ownership',
    text: 'You confirm that you own the rights to the design and it does not violate any third-party rights.'
  },
  {
    id: 'approval',
    title: 'Design approval',
    text: 'We reserve the right to review and approve designs before they go live on the platform.'
  },
  {
    id: 'returns',
    title: 'Cancellation / returns',
    text: 'In case of order cancellation or return, commission will not be paid for that order.'
  },
  {
    id: 'wallet',
    title: 'Wallet & payment',
    text: 'Commission (10%) will be credited to your wallet after the parcel is delivered to the customer.'
  },
  {
    id: 'changes',
    title: 'Changes to terms',
    text: 'We may update these terms & conditions from time to time. Continued participation means you agree to the updated terms.'
  }
];

export interface SellYourDesignMenuNode {
  id?: string;
  uuid?: string;
  name?: string;
  url?: string;
  type?: string;
  children?: SellYourDesignMenuNode[];
}

function hasPath(nodes: SellYourDesignMenuNode[], path: string): boolean {
  return nodes.some(
    (node) =>
      node?.url === path ||
      (Array.isArray(node?.children) && hasPath(node.children, path))
  );
}

/** The banner src is the one shipped file. Any other path is ignored. */
export function sellYourDesignBanner(src: unknown): string | null {
  return src === SELL_YOUR_DESIGN_BANNER ? SELL_YOUR_DESIGN_BANNER : null;
}

/**
 * Add Sell your design to the header menu, after How To order.
 * Returns null when the path is already there.
 */
export function insertSellYourDesignMenu(
  menus: SellYourDesignMenuNode[]
): SellYourDesignMenuNode[] | null {
  if (!Array.isArray(menus) || hasPath(menus, SELL_YOUR_DESIGN_PATH)) {
    return null;
  }
  const node: SellYourDesignMenuNode = {
    id: SELL_YOUR_DESIGN_MENU_ID,
    uuid: SELL_YOUR_DESIGN_MENU_ID,
    name: SELL_YOUR_DESIGN_LABEL,
    url: SELL_YOUR_DESIGN_PATH,
    type: 'custom',
    children: []
  };
  const afterHowTo = menus.findIndex((item) => item?.url === '/how-to-order');
  if (afterHowTo >= 0) {
    return [...menus.slice(0, afterHowTo + 1), node, ...menus.slice(afterHowTo + 1)];
  }
  const afterApply = menus.findIndex((item) => item?.url === '/apply-fabric');
  if (afterApply >= 0) {
    return [...menus.slice(0, afterApply + 1), node, ...menus.slice(afterApply + 1)];
  }
  const beforeAbout = menus.findIndex((item) => item?.url === '/about-us');
  if (beforeAbout >= 0) {
    return [...menus.slice(0, beforeAbout), node, ...menus.slice(beforeAbout)];
  }
  return [...menus, node];
}
