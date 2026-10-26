import { randomUUID } from 'node:crypto';

export const APPLY_FABRIC_PATH = '/apply-fabric';
export const APPLY_FABRIC_LABEL = 'Apply Fabric';

export interface ApplyFabricMenuNode {
  id?: string;
  uuid?: string;
  name?: string;
  url?: string;
  type?: string;
  children?: ApplyFabricMenuNode[];
}

function hasApplyFabric(nodes: ApplyFabricMenuNode[]): boolean {
  return nodes.some(
    (node) =>
      node?.url === APPLY_FABRIC_PATH ||
      (Array.isArray(node?.children) && hasApplyFabric(node.children))
  );
}

function menuNode(): ApplyFabricMenuNode {
  const id = randomUUID();
  return {
    id,
    uuid: id,
    name: APPLY_FABRIC_LABEL,
    url: APPLY_FABRIC_PATH,
    type: 'custom',
    children: []
  };
}

/**
 * Insert Apply Fabric into the storefront header menu, after Designs when
 * that item exists, otherwise after Fabrics. Returns null when the menu
 * already links there.
 */
export function insertApplyFabricMenu(
  menus: ApplyFabricMenuNode[]
): ApplyFabricMenuNode[] | null {
  if (!Array.isArray(menus) || hasApplyFabric(menus)) {
    return null;
  }
  const designsAt = menus.findIndex(
    (item) => item?.url === '/designs' || item?.url?.startsWith('/designs?')
  );
  const fabricsAt = menus.findIndex(
    (item) => typeof item?.name === 'string' && item.name.toLowerCase() === 'fabrics'
  );
  const at = designsAt >= 0 ? designsAt : fabricsAt;
  const node = menuNode();
  if (at >= 0) {
    return [...menus.slice(0, at + 1), node, ...menus.slice(at + 1)];
  }
  return [...menus, node];
}
