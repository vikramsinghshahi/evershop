import type { PoolClient } from 'pg';
import { select, update } from '@evershop/postgres-query-builder';
import { TERMS_PAGE_DEFAULTS } from '../services/termsPageDefaults.js';
import {
  ensureTermsFooter,
  type TermsFooterColumn
} from '../services/termsFooter.js';

/**
 * Terms & Conditions as a CMS page the admin can enable or disable.
 * The wording lives on the page widget. The footer gains the link once,
 * in the column that already holds About or Contact.
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

async function ensurePage(connection: PoolClient): Promise<string> {
  const existing = await connection.query(
    `SELECT p.uuid
       FROM cms_page p
       JOIN cms_page_description d
         ON d.cms_page_description_cms_page_id = p.cms_page_id
      WHERE d.url_key = $1`,
    ['terms-and-conditions']
  );
  if (existing.rows[0]?.uuid) {
    return existing.rows[0].uuid as string;
  }
  const inserted = await connection.query(
    `INSERT INTO cms_page (status) VALUES (true) RETURNING cms_page_id, uuid`
  );
  const row = inserted.rows[0];
  await connection.query(
    `INSERT INTO cms_page_description (
       cms_page_description_cms_page_id,
       url_key,
       name,
       content,
       meta_title,
       meta_description,
       meta_keywords
     ) VALUES ($1, $2, $3, '[]', $4, $5, '')`,
    [
      row.cms_page_id,
      'terms-and-conditions',
      'Terms & Conditions',
      'Terms & Conditions',
      'Please read these terms before placing an order with Bharat Textile.'
    ]
  );
  await connection.query(
    `INSERT INTO url_rewrite (entity_type, entity_uuid, request_path, target_path)
     VALUES ('cms_page', $1, $2, $3)
     ON CONFLICT (entity_uuid) DO UPDATE
       SET request_path = EXCLUDED.request_path,
           target_path = EXCLUDED.target_path,
           entity_type = EXCLUDED.entity_type`,
    [row.uuid, '/terms-and-conditions', '/page/terms-and-conditions']
  );
  return row.uuid as string;
}

export default async (connection: PoolClient) => {
  const pageUuid = await ensurePage(connection);
  const entityUrn = `urn:evershop:cms:page:${pageUuid}`;
  const existing = await connection.query(
    `SELECT wi.widget_instance_id
       FROM widget_instance wi
       JOIN widget_placement p
         ON p.widget_instance_id = wi.widget_instance_id
      WHERE wi.type = 'terms_page'
        AND p.entity_urn = $1
        AND p.route = 'cmsPageView'`,
    [entityUrn]
  );
  if (!existing.rows[0]) {
    const inserted = await connection.query(
      `INSERT INTO widget_instance (name, type, settings, status, theme)
       VALUES ($1, 'terms_page', $2::jsonb, true, NULL)
       RETURNING widget_instance_id`,
      ['Terms and conditions', JSON.stringify(TERMS_PAGE_DEFAULTS)]
    );
    await connection.query(
      `INSERT INTO widget_placement
         (widget_instance_id, route, area, sort_order, entity_urn, theme)
       VALUES ($1, 'cmsPageView', 'content', 0, $2, NULL)`,
      [inserted.rows[0].widget_instance_id, entityUrn]
    );
  }

  const footers = await select()
    .from('widget_instance')
    .where('type', '=', 'store_footer')
    .execute(connection);
  for (const row of footers) {
    const settings = parseSettings(row.settings);
    const nextColumns = ensureTermsFooter(
      Array.isArray(settings.columns)
        ? (settings.columns as TermsFooterColumn[])
        : []
    );
    if (!nextColumns) {
      continue;
    }
    await update('widget_instance')
      .given({
        settings: JSON.stringify({ ...settings, columns: nextColumns })
      })
      .where('widget_instance_id', '=', row.widget_instance_id)
      .execute(connection);
  }
};
