export const ABOUT_PATH = '/about-us';
export const CONTACT_PATH = '/contact-us';

export interface CompanyMenuNode {
  id?: string;
  name?: string;
  url?: string;
  type?: string;
  uuid?: string;
  children?: CompanyMenuNode[];
}

export interface CompanyFooterLink {
  id?: string;
  label?: string;
  url?: string;
}

export interface CompanyFooterColumn {
  id?: string;
  title?: string;
  links?: CompanyFooterLink[];
}

function menuHasUrl(nodes: CompanyMenuNode[], url: string): boolean {
  return nodes.some(
    (node) =>
      node?.url === url ||
      (Array.isArray(node?.children) && menuHasUrl(node.children, url))
  );
}

/**
 * Add About Us and Contact Us when those paths are missing.
 * Returns null when the menu already has both.
 */
export function ensureCompanyMenus(
  menus: CompanyMenuNode[],
  ids: { aboutId: string; contactId: string }
): CompanyMenuNode[] | null {
  if (!Array.isArray(menus)) {
    return null;
  }
  const next = [...menus];
  let changed = false;
  if (!menuHasUrl(next, ABOUT_PATH)) {
    next.push({
      id: ids.aboutId,
      uuid: ids.aboutId,
      name: 'About Us',
      url: ABOUT_PATH,
      type: 'custom',
      children: []
    });
    changed = true;
  }
  if (!menuHasUrl(next, CONTACT_PATH)) {
    next.push({
      id: ids.contactId,
      uuid: ids.contactId,
      name: 'Contact Us',
      url: CONTACT_PATH,
      type: 'custom',
      children: []
    });
    changed = true;
  }
  return changed ? next : null;
}

/**
 * Add a Contact us footer link beside About us when that path is missing.
 * Returns null when a contact link is already present.
 */
export function ensureCompanyFooter(
  columns: CompanyFooterColumn[],
  contactId: string
): CompanyFooterColumn[] | null {
  if (!Array.isArray(columns) || columns.length === 0) {
    return null;
  }
  const hasContact = columns.some((column) =>
    (column.links ?? []).some((link) => link?.url === CONTACT_PATH)
  );
  if (hasContact) {
    return null;
  }
  const next = columns.map((column) => ({
    ...column,
    links: Array.isArray(column.links) ? [...column.links] : []
  }));
  const host =
    next.find((column) =>
      column.links.some((link) => link?.url === ABOUT_PATH)
    ) ?? next[next.length - 1];
  host.links.push({
    id: contactId,
    label: 'Contact us',
    url: CONTACT_PATH
  });
  return next;
}
