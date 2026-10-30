import { select, update } from '@evershop/postgres-query-builder';
import type { PoolClient } from 'pg';
import { ABOUT_STORY_DEFAULTS } from '../services/aboutStoryDefaults.js';
import {
  ensureCompanyFooter,
  ensureCompanyMenus,
  type CompanyFooterColumn,
  type CompanyMenuNode
} from '../services/companyPageLinks.js';
import { CONTACT_PAGE_DEFAULTS } from '../services/contactPageDefaults.js';

/**
 * About Us and Contact Us as CMS pages the admin can enable or disable.
 * Wording lives on the page widgets. Phone, email, and address are filled
 * into the existing store settings only where those fields are still blank,
 * using the details published on bharattextileindia.com. The published
 * contact page has no phone number, so the phone field is left empty.
 */

const ABOUT_MENU_ID = '8f3c1a20-6d4e-4b11-9c77-1a2b3c4d5e60';
const CONTACT_MENU_ID = '9a4d2b31-7e5f-4c22-8d88-2b3c4d5e6f71';
const CONTACT_FOOTER_ID = 'lnk-contact';

const STORE_CONTACT = {
  storeEmail: 'info@bharattextileindia.com',
  storeAddress: 'House no. 904/1044, Gali no. 6, near Chacha Chowk',
  storeCity: 'Faridabad',
  storeCountry: 'IN'
};

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

async function fillBlankSetting(
  connection: PoolClient,
  name: string,
  value: string
) {
  await connection.query(
    `UPDATE setting
        SET value = $2
      WHERE name = $1
        AND (value IS NULL OR btrim(value) = '')`,
    [name, value]
  );
}

async function ensurePage(
  connection: PoolClient,
  page: {
    urlKey: string;
    name: string;
    metaTitle: string;
    metaDescription: string;
  }
): Promise<string> {
  const existing = await connection.query(
    `SELECT p.uuid
       FROM cms_page p
       JOIN cms_page_description d
         ON d.cms_page_description_cms_page_id = p.cms_page_id
      WHERE d.url_key = $1`,
    [page.urlKey]
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
    [row.cms_page_id, page.urlKey, page.name, page.metaTitle, page.metaDescription]
  );
  await connection.query(
    `INSERT INTO url_rewrite (entity_type, entity_uuid, request_path, target_path)
     VALUES ('cms_page', $1, $2, $3)
     ON CONFLICT (entity_uuid) DO UPDATE
       SET request_path = EXCLUDED.request_path,
           target_path = EXCLUDED.target_path,
           entity_type = EXCLUDED.entity_type`,
    [row.uuid, `/${page.urlKey}`, `/page/${page.urlKey}`]
  );
  return row.uuid as string;
}

async function ensureWidget(
  connection: PoolClient,
  widget: {
    name: string;
    type: string;
    settings: Record<string, unknown>;
    entityUrn: string;
    sortOrder: number;
  }
) {
  const existing = await connection.query(
    `SELECT wi.widget_instance_id
       FROM widget_instance wi
       JOIN widget_placement p
         ON p.widget_instance_id = wi.widget_instance_id
      WHERE wi.type = $1
        AND p.entity_urn = $2
        AND p.route = 'cmsPageView'`,
    [widget.type, widget.entityUrn]
  );
  if (existing.rows[0]) {
    return;
  }
  const inserted = await connection.query(
    `INSERT INTO widget_instance (name, type, settings, status, theme)
     VALUES ($1, $2, $3::jsonb, true, NULL)
     RETURNING widget_instance_id`,
    [widget.name, widget.type, JSON.stringify(widget.settings)]
  );
  await connection.query(
    `INSERT INTO widget_placement
       (widget_instance_id, route, area, sort_order, entity_urn, theme)
     VALUES ($1, 'cmsPageView', 'content', $2, $3, NULL)`,
    [inserted.rows[0].widget_instance_id, widget.sortOrder, widget.entityUrn]
  );
}

export default async (connection: PoolClient) => {
  // The seeded province is Delhi. Replace it only while the address is still
  // blank, so a store that already typed its own address keeps its province.
  await connection.query(
    `UPDATE setting AS province
        SET value = 'IN-HR'
      WHERE province.name = 'storeProvince'
        AND EXISTS (
          SELECT 1
            FROM setting AS address
           WHERE address.name = 'storeAddress'
             AND (address.value IS NULL OR btrim(address.value) = '')
        )`
  );
  for (const [name, value] of Object.entries(STORE_CONTACT)) {
    await fillBlankSetting(connection, name, value);
  }

  const aboutUuid = await ensurePage(connection, {
    urlKey: 'about-us',
    name: 'About Us',
    metaTitle: 'About Us',
    metaDescription:
      'Thirty-two years of textile experience, custom digital fabric printing, and an international vision.'
  });
  await connection.query(
    `UPDATE cms_page_description
        SET content = '[]',
            meta_title = 'About Us',
            meta_description = 'Thirty-two years of textile experience, custom digital fabric printing, and an international vision.',
            name = 'About Us'
      WHERE url_key = 'about-us'
        AND content LIKE '%Welcome to Our Store%'`
  );
  await connection.query(
    `UPDATE cms_page
        SET status = true
      WHERE uuid = $1
        AND status IS NULL`,
    [aboutUuid]
  );

  const contactUuid = await ensurePage(connection, {
    urlKey: 'contact-us',
    name: 'Contact Us',
    metaTitle: 'Contact Us',
    metaDescription:
      'Write to Bharat Textile India about a fabric, a print, or a partnership.'
  });

  const aboutUrn = `urn:evershop:cms:page:${aboutUuid}`;
  const contactUrn = `urn:evershop:cms:page:${contactUuid}`;

  await ensureWidget(connection, {
    name: 'About story',
    type: 'about_story',
    settings: ABOUT_STORY_DEFAULTS,
    entityUrn: aboutUrn,
    sortOrder: 0
  });
  await ensureWidget(connection, {
    name: 'Contact details',
    type: 'contact_details',
    settings: CONTACT_PAGE_DEFAULTS,
    entityUrn: contactUrn,
    sortOrder: 0
  });

  const menus = await select()
    .from('widget_instance')
    .where('type', '=', 'basic_menu')
    .execute(connection);
  for (const row of menus) {
    const settings = parseSettings(row.settings);
    if (settings.isMain === false) {
      continue;
    }
    const nextMenus = ensureCompanyMenus(
      Array.isArray(settings.menus) ? (settings.menus as CompanyMenuNode[]) : [],
      { aboutId: ABOUT_MENU_ID, contactId: CONTACT_MENU_ID }
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
    const nextColumns = ensureCompanyFooter(
      Array.isArray(settings.columns)
        ? (settings.columns as CompanyFooterColumn[])
        : [],
      CONTACT_FOOTER_ID
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
