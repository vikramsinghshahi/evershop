import { execute } from '@evershop/postgres-query-builder';
import type { PoolClient } from 'pg';

/**
 * Fabrics category plus five printable cloths (viscose, cotton, rayon).
 * Safe to run again: existing skus and the category url_key are left in place.
 */
export default async (connection: PoolClient) => {
  await execute(
    connection,
    `DO $$
DECLARE
  cat_id INT;
  cat_uuid UUID;
  prod_id INT;
  prod_uuid UUID;
  pkg_id INT;
  tax_id INT;
  grp_id INT;
  rec RECORD;
BEGIN
  SELECT attribute_group_id INTO grp_id
  FROM attribute_group
  ORDER BY attribute_group_id
  LIMIT 1;

  SELECT package_id INTO pkg_id FROM package ORDER BY package_id LIMIT 1;
  SELECT tax_class_id INTO tax_id FROM tax_class ORDER BY tax_class_id LIMIT 1;

  SELECT c.category_id, c.uuid INTO cat_id, cat_uuid
  FROM category_description d
  JOIN category c ON c.category_id = d.category_description_category_id
  WHERE d.url_key = 'fabrics';

  IF cat_id IS NULL THEN
    INSERT INTO category (status, position, show_products)
    VALUES (true, 40, true)
    RETURNING category_id, uuid INTO cat_id, cat_uuid;

    INSERT INTO category_description (
      category_description_category_id,
      name,
      short_description,
      description,
      url_key
    ) VALUES (
      cat_id,
      'Fabrics',
      'Print fabrics sold by the metre.',
      'Choose a cloth, set the image scale, and that scale stays on the line through checkout.',
      'fabrics'
    );

    INSERT INTO url_rewrite (request_path, target_path, entity_uuid, entity_type)
    VALUES (
      '/fabrics',
      '/category/' || cat_uuid::text,
      cat_uuid,
      'category'
    );
  END IF;

  FOR rec IN
    SELECT * FROM (VALUES
      ('FABRIC-VISCOSE-CUPRO'::varchar, 'Viscose Cupro'::varchar, 'viscose-cupro'::varchar, 24.0::numeric, 'Smooth cupro-viscose with a soft drape.'::text),
      ('FABRIC-COTTON-POPLIN'::varchar, 'Cotton Poplin'::varchar, 'cotton-poplin'::varchar, 18.0::numeric, 'Crisp cotton poplin for shirts and lining.'::text),
      ('FABRIC-VISCOSE-MOSS'::varchar, 'Viscose Moss Crepe'::varchar, 'viscose-moss-crepe'::varchar, 28.0::numeric, 'Moss crepe viscose with a dry, textured hand.'::text),
      ('FABRIC-COTTON-LAWN'::varchar, 'Cotton Lawn'::varchar, 'cotton-lawn'::varchar, 22.0::numeric, 'Light cotton lawn that holds a fine print.'::text),
      ('FABRIC-RAYON-MOSS'::varchar, 'Rayon Moss Crepe'::varchar, 'rayon-moss-crepe'::varchar, 26.0::numeric, 'Rayon moss crepe with a fluid drape.'::text)
    ) AS t(sku, name, slug, price, summary)
  LOOP
    prod_id := NULL;
    prod_uuid := NULL;

    SELECT p.product_id, p.uuid INTO prod_id, prod_uuid
    FROM product p
    WHERE p.sku = rec.sku;

    IF prod_id IS NULL THEN
      INSERT INTO product (
        type, visibility, group_id, sku, price, weight, tax_class, status, category_id, package_id
      ) VALUES (
        'simple', true, grp_id, rec.sku, rec.price, 0.2000, tax_id, true, cat_id, pkg_id
      )
      RETURNING product_id, uuid INTO prod_id, prod_uuid;

      INSERT INTO product_description (
        product_description_product_id, name, short_description, description, url_key
      ) VALUES (
        prod_id, rec.name, rec.summary, rec.summary, rec.slug
      );
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM product_inventory WHERE product_inventory_product_id = prod_id
    ) THEN
      INSERT INTO product_inventory (
        product_inventory_product_id, qty, manage_stock, stock_availability
      ) VALUES (prod_id, 500, true, true);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM url_rewrite WHERE entity_uuid = prod_uuid
    ) THEN
      INSERT INTO url_rewrite (request_path, target_path, entity_uuid, entity_type)
      VALUES (
        '/fabrics/' || rec.slug,
        '/product/' || prod_uuid::text,
        prod_uuid,
        'product'
      );
    END IF;
  END LOOP;
END $$;`
  );
};
