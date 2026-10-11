import { execute } from '@evershop/postgres-query-builder';
import type { PoolClient } from 'pg';

/**
 * Selling unit and minimum order quantity. Blank on accessories. Existing
 * cloths in the Fabrics category start at 1 meter.
 */
export default async (connection: PoolClient) => {
  await execute(
    connection,
    `ALTER TABLE "product"
       ADD COLUMN IF NOT EXISTS "sale_unit" varchar(16) DEFAULT NULL,
       ADD COLUMN IF NOT EXISTS "moq" INT DEFAULT NULL`
  );
  await execute(
    connection,
    `ALTER TABLE "order_item"
       ADD COLUMN IF NOT EXISTS "sale_unit" varchar(16) DEFAULT NULL,
       ADD COLUMN IF NOT EXISTS "moq" INT DEFAULT NULL`
  );
  await execute(
    connection,
    `UPDATE "product"
     SET "sale_unit" = 'm', "moq" = 1
     WHERE "sale_unit" IS NULL
       AND (
         "sku" ILIKE 'FABRIC-%'
         OR "category_id" IN (
           SELECT category.category_id
           FROM category
           INNER JOIN category_description
             ON category_description.category_description_category_id = category.category_id
           WHERE category_description.url_key = 'fabrics'
         )
       )`
  );
};
