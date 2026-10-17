import { execute, select, update } from '@evershop/postgres-query-builder';
import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';

/**
 * Put Designs in the storefront header menu and the footer Shop column,
 * next to Fabrics. Idempotent: skips a widget that already links to /designs.
 */

interface MenuNode {
  id?: string;
  uuid?: string;
  name?: string;
  url?: string;
  type?: string;
  children?: MenuNode[];
}

interface FooterLink {
  id?: string;
  label?: string;
  url?: string;
}

interface FooterColumn {
  id?: string;
  title?: string;
  links?: FooterLink[];
}

function parseSettings(raw: unknown): Record<string, unknown> {
  if (raw == null) {
    return {};
  }
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof raw === 'object') {
    return raw as Record<string, unknown>;
  }
  return {};
}

function hasDesignsUrl(url: unknown): boolean {
  return typeof url === 'string' && (url === '/designs' || url.startsWith('/designs?'));
}

function designsMenuNode(): MenuNode {
  const id = randomUUID();
  return { id, uuid: id, name: 'Designs', url: '/designs', type: 'custom', children: [] };
}

function insertDesignsMenu(menus: MenuNode[]): MenuNode[] | null {
  if (!Array.isArray(menus) || menus.some((item) => hasDesignsUrl(item?.url))) {
    return null;
  }
  const fabricsAt = menus.findIndex(
    (item) =>
      typeof item?.name === 'string' && item.name.toLowerCase() === 'fabrics'
  );
  if (fabricsAt >= 0) {
    return [
      ...menus.slice(0, fabricsAt + 1),
      designsMenuNode(),
      ...menus.slice(fabricsAt + 1)
    ];
  }
  return [designsMenuNode(), ...menus];
}

function insertDesignsFooter(columns: FooterColumn[]): FooterColumn[] | null {
  if (!Array.isArray(columns)) {
    return null;
  }
  let changed = false;
  const next = columns.map((column) => {
    const links = Array.isArray(column?.links) ? column.links : [];
    if (links.some((link) => hasDesignsUrl(link?.url))) {
      return column;
    }
    const isShop =
      column?.id === 'col-shop' ||
      (typeof column?.title === 'string' && column.title.toLowerCase() === 'shop');
    if (!isShop) {
      return column;
    }
    changed = true;
    const fabricsAt = links.findIndex(
      (link) =>
        typeof link?.label === 'string' && link.label.toLowerCase() === 'fabrics'
    );
    const designs = { id: 'lnk-designs', label: 'Designs', url: '/designs' };
    const updated =
      fabricsAt >= 0
        ? [...links.slice(0, fabricsAt + 1), designs, ...links.slice(fabricsAt + 1)]
        : [designs, ...links];
    return { ...column, links: updated };
  });
  return changed ? next : null;
}

export default async (connection: PoolClient) => {
  const menus = await select()
    .from('widget_instance')
    .where('type', '=', 'basic_menu')
    .execute(connection);

  for (const row of menus) {
    const settings = parseSettings(row.settings);
    const nextMenus = insertDesignsMenu(
      Array.isArray(settings.menus) ? (settings.menus as MenuNode[]) : []
    );
    if (!nextMenus) {
      continue;
    }
    await update('widget_instance')
      .given({ settings: JSON.stringify({ ...settings, menus: nextMenus }) })
      .where('widget_instance_id', '=', row.widget_instance_id)
      .execute(connection);
  }

  const footers = await select()
    .from('widget_instance')
    .where('type', '=', 'store_footer')
    .execute(connection);

  for (const row of footers) {
    const settings = parseSettings(row.settings);
    const nextColumns = insertDesignsFooter(
      Array.isArray(settings.columns) ? (settings.columns as FooterColumn[]) : []
    );
    if (!nextColumns) {
      continue;
    }
    await update('widget_instance')
      .given({ settings: JSON.stringify({ ...settings, columns: nextColumns }) })
      .where('widget_instance_id', '=', row.widget_instance_id)
      .execute(connection);
  }

  // Touch so the statement list is never empty on a store that already has Designs.
  await execute(connection, `SELECT 1`);
};
