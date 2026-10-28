import { execute, select, update } from '@evershop/postgres-query-builder';
import type { PoolClient } from 'pg';
import {
  retargetFabricFooter,
  retargetFabricMenus,
  type FabricFooterColumn,
  type FabricMenuNode
} from '../services/fabricPageLink.js';

/**
 * The store homepage is the landing page. A Fabrics link that still opens
 * `/` is pointed at the fabric catalog. Links that already go to /fabrics
 * are left as they are.
 */

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

export default async (connection: PoolClient) => {
  const menus = await select()
    .from('widget_instance')
    .where('type', '=', 'basic_menu')
    .execute(connection);

  for (const row of menus) {
    const settings = parseSettings(row.settings);
    const nextMenus = retargetFabricMenus(
      Array.isArray(settings.menus) ? (settings.menus as FabricMenuNode[]) : []
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
    const nextColumns = retargetFabricFooter(
      Array.isArray(settings.columns)
        ? (settings.columns as FabricFooterColumn[])
        : []
    );
    if (!nextColumns) {
      continue;
    }
    await update('widget_instance')
      .given({ settings: JSON.stringify({ ...settings, columns: nextColumns }) })
      .where('widget_instance_id', '=', row.widget_instance_id)
      .execute(connection);
  }

  await execute(connection, 'SELECT 1');
};
