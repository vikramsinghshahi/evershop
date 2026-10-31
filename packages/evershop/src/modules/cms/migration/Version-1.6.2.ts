import { execute, select, update } from '@evershop/postgres-query-builder';
import type { PoolClient } from 'pg';
import {
  insertHowToOrderMenu,
  type HowToOrderMenuNode
} from '../services/howToOrder.js';

/**
 * Add How To order to the main header menu. A menu that already links to
 * /how-to-order is left as it is. Secondary menus are left as they are.
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
    if (settings.isMain === false) {
      continue;
    }
    const nextMenus = insertHowToOrderMenu(
      Array.isArray(settings.menus) ? (settings.menus as HowToOrderMenuNode[]) : []
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
