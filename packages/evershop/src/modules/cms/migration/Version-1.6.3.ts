import type { PoolClient } from 'pg';

/**
 * Place the store announcement on every page, above the nav. A bar already
 * sitting in that slot is left as it is, so a later edit in admin is kept.
 */

const ANNOUNCEMENT = {
  backgroundColor: '#3d4a45',
  textColor: '#f4efe6',
  delay: 4000,
  motion: 'marquee',
  announcements: [
    {
      id: 'store-announcement-fabrics',
      content: 'Printed and plain fabrics, sold by the metre',
      link: null
    },
    {
      id: 'store-announcement-shipping',
      content: 'Worldwide shipping on every order',
      link: null
    }
  ]
};

export default async (connection: PoolClient) => {
  const existing = await connection.query(
    `SELECT wi.widget_instance_id
       FROM widget_instance wi
       JOIN widget_placement p
         ON p.widget_instance_id = wi.widget_instance_id
      WHERE wi.type = 'announcement_bar'
        AND p.route = 'all'
        AND p.area = 'headerTop'
        AND p.entity_urn IS NULL
      LIMIT 1`
  );
  if (existing.rows[0]) return;

  const inserted = await connection.query(
    `INSERT INTO widget_instance (name, type, settings, status, theme)
     VALUES ('Store announcement', 'announcement_bar', $1::jsonb, true, NULL)
     RETURNING widget_instance_id`,
    [JSON.stringify(ANNOUNCEMENT)]
  );
  await connection.query(
    `INSERT INTO widget_placement
       (widget_instance_id, route, area, sort_order, entity_urn, theme)
     VALUES ($1, 'all', 'headerTop', 0, NULL, NULL)`,
    [inserted.rows[0].widget_instance_id]
  );
};
