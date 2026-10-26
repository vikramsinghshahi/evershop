import { execute, select, update } from '@evershop/postgres-query-builder';
import type { PoolClient } from 'pg';
import {
  insertApplyFabricMenu,
  type ApplyFabricMenuNode
} from '../services/applyFabricMenu.js';

/**
 * Add Apply Fabric to the storefront header menu. Idempotent: a menu that
 * already links to /apply-fabric is left as it is. Footer columns are not
 * changed.
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
    const nextMenus = insertApplyFabricMenu(
      Array.isArray(settings.menus) ? (settings.menus as ApplyFabricMenuNode[]) : []
    );
    if (!nextMenus) {
      continue;
    }
    await update('widget_instance')
      .given({ settings: JSON.stringify({ ...settings, menus: nextMenus }) })
      .where('widget_instance_id', '=', row.widget_instance_id)
      .execute(connection);
  }

  await execute(connection, 'SELECT 1');
};
