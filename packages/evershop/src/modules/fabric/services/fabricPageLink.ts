export const FABRICS_PATH = '/fabrics';

export interface FabricMenuNode {
  name?: string;
  url?: string;
  children?: FabricMenuNode[];
}

export interface FabricFooterLink {
  label?: string;
  url?: string;
}

export interface FabricFooterColumn {
  links?: FabricFooterLink[];
}

/** True when a menu URL is the store homepage, including a hash on that path. */
export function isStoreHomeUrl(url?: string | null): boolean {
  if (url == null) {
    return true;
  }
  const path = url.split('?')[0].split('#')[0].replace(/\/+$/, '');
  return path === '';
}

function retargetNode(node: FabricMenuNode): { node: FabricMenuNode; changed: boolean } {
  let changed = false;
  let next = node;
  if (
    typeof node?.name === 'string' &&
    node.name.toLowerCase() === 'fabrics' &&
    isStoreHomeUrl(node.url)
  ) {
    changed = true;
    next = { ...node, url: FABRICS_PATH };
  }
  if (Array.isArray(next.children) && next.children.length > 0) {
    const children = retargetMenus(next.children);
    if (children) {
      changed = true;
      next = { ...next, children };
    }
  }
  return { node: next, changed };
}

/**
 * Point a header item named Fabrics at the fabric catalog when it still
 * opens the homepage. Returns null when nothing needs to change.
 */
export function retargetFabricMenus(
  menus: FabricMenuNode[]
): FabricMenuNode[] | null {
  return retargetMenus(menus);
}

function retargetMenus(menus: FabricMenuNode[]): FabricMenuNode[] | null {
  if (!Array.isArray(menus)) {
    return null;
  }
  let changed = false;
  const next = menus.map((item) => {
    const result = retargetNode(item);
    if (result.changed) {
      changed = true;
    }
    return result.node;
  });
  return changed ? next : null;
}

/**
 * Point a footer link labeled Fabrics at the fabric catalog when it still
 * opens the homepage. Returns null when nothing needs to change.
 */
export function retargetFabricFooter(
  columns: FabricFooterColumn[]
): FabricFooterColumn[] | null {
  if (!Array.isArray(columns)) {
    return null;
  }
  let changed = false;
  const next = columns.map((column) => {
    const links = Array.isArray(column?.links) ? column.links : [];
    let columnChanged = false;
    const updated = links.map((link) => {
      if (
        typeof link?.label === 'string' &&
        link.label.toLowerCase() === 'fabrics' &&
        isStoreHomeUrl(link.url)
      ) {
        columnChanged = true;
        return { ...link, url: FABRICS_PATH };
      }
      return link;
    });
    if (!columnChanged) {
      return column;
    }
    changed = true;
    return { ...column, links: updated };
  });
  return changed ? next : null;
}
