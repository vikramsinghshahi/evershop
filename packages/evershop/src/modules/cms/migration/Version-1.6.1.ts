import type { PoolClient } from 'pg';

/**
 * The contact page draws its own message form, so the separate contact-form
 * widget on that page would show a second form. Remove only that placement.
 */
export default async (connection: PoolClient) => {
  await connection.query(
    `DELETE FROM widget_instance
      WHERE type = 'contact_form'
        AND widget_instance_id IN (
          SELECT p.widget_instance_id
            FROM widget_placement p
            JOIN cms_page page
              ON p.entity_urn = 'urn:evershop:cms:page:' || page.uuid::text
            JOIN cms_page_description d
              ON d.cms_page_description_cms_page_id = page.cms_page_id
           WHERE d.url_key = 'contact-us'
             AND p.route = 'cmsPageView'
        )`
  );
};
