export const HOW_TO_ORDER_PATH = '/how-to-order';
export const HOW_TO_ORDER_LABEL = 'How To order';
export const HOW_TO_ORDER_MENU_ID = 'c1e7a4b2-3d58-4f90-8a61-6b0e2f9c4d18';

export interface HowToOrderStep {
  id: string;
  title: string;
  text: string;
  image: string;
  alt: string;
  href?: string;
  link?: string;
}

/**
 * The six illustrations from the design folder, stored as small WebP files.
 * The words follow the controls on a fabric page.
 */
export const HOW_TO_ORDER_STEPS: readonly HowToOrderStep[] = [
  {
    id: 'fabric',
    title: 'Choose a fabric',
    text: 'Open Fabrics and pick a cloth. The page shows its width and price.',
    image: '/how-to-order/step-1.webp',
    alt: 'A stack of folded white fabric',
    href: '/fabrics',
    link: 'Browse fabrics'
  },
  {
    id: 'design',
    title: 'Upload a design',
    text: 'Choose Print, then upload a PNG, JPG, or WebP, or pick a design from the library.',
    image: '/how-to-order/step-2.webp',
    alt: 'A laptop with an upload design window',
    href: '/designs',
    link: 'See designs'
  },
  {
    id: 'place',
    title: 'Place it on the cloth',
    text: 'Choose Center, Tile, Mirror, Vertical, or Brick, and turn it by a quarter turn.',
    image: '/how-to-order/step-3.webp',
    alt: 'A floral design placed on a fabric canvas'
  },
  {
    id: 'scale',
    title: 'Set the scale',
    text: 'The scale starts at 100 and moves in whole numbers from 1 to 100.',
    image: '/how-to-order/step-4.webp',
    alt: 'A scale control set to 100 percent with a fabric preview'
  },
  {
    id: 'quantity',
    title: 'Set the metres',
    text: 'The size starts on Linear meter. Set the quantity and add it to the cart.',
    image: '/how-to-order/step-5.webp',
    alt: 'A quantity field in metres next to fabric details'
  },
  {
    id: 'checkout',
    title: 'Check out',
    text: 'Review the cart, then proceed to checkout.',
    image: '/how-to-order/step-6.webp',
    alt: 'A cart with a printed fabric and a checkout button',
    href: '/cart',
    link: 'Open the cart'
  }
];

export interface HowToOrderMenuNode {
  id?: string;
  uuid?: string;
  name?: string;
  url?: string;
  type?: string;
  children?: HowToOrderMenuNode[];
}

function hasPath(nodes: HowToOrderMenuNode[], path: string): boolean {
  return nodes.some(
    (node) =>
      node?.url === path ||
      (Array.isArray(node?.children) && hasPath(node.children, path))
  );
}

/** Drop a step that has no title or no explanation. The page never renders a blank row. */
export function howToOrderSteps(
  steps: readonly HowToOrderStep[] = HOW_TO_ORDER_STEPS
): HowToOrderStep[] {
  if (!Array.isArray(steps)) {
    return [];
  }
  return steps.filter(
    (step) =>
      typeof step?.title === 'string' &&
      step.title.trim() !== '' &&
      typeof step?.text === 'string' &&
      step.text.trim() !== ''
  );
}

/** A preview src is one of the six shipped files. Any other path is ignored. */
export function howToOrderImage(src: unknown): string | null {
  if (typeof src !== 'string') {
    return null;
  }
  const known = HOW_TO_ORDER_STEPS.some((step) => step.image === src);
  return known ? src : null;
}

/**
 * Add How To order to the header menu. It sits after Apply Fabric, or before
 * About Us when that link is missing. Returns null when the path is already there.
 */
export function insertHowToOrderMenu(
  menus: HowToOrderMenuNode[]
): HowToOrderMenuNode[] | null {
  if (!Array.isArray(menus) || hasPath(menus, HOW_TO_ORDER_PATH)) {
    return null;
  }
  const node: HowToOrderMenuNode = {
    id: HOW_TO_ORDER_MENU_ID,
    uuid: HOW_TO_ORDER_MENU_ID,
    name: HOW_TO_ORDER_LABEL,
    url: HOW_TO_ORDER_PATH,
    type: 'custom',
    children: []
  };
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
