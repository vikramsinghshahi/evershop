import { execute } from '@evershop/postgres-query-builder';
import type { PoolClient } from 'pg';

/**
 * Swatch prices for a fabric. Linear meter keeps using `product.price`.
 * Existing cloths start at 40% (test, 20×20 cm) and 80% (big, 75×100 cm)
 * of that price. An admin can replace either amount.
 */
export default async (connection: PoolClient) => {
  await execute(
    connection,
    `ALTER TABLE "product"
       ADD COLUMN IF NOT EXISTS "price_test_swatch" decimal(12,4) DEFAULT NULL,
       ADD COLUMN IF NOT EXISTS "price_big_swatch" decimal(12,4) DEFAULT NULL`
  );
  await execute(
    connection,
    `UPDATE "product"
     SET "price_test_swatch" = ROUND("price" * 0.4, 2),
         "price_big_swatch" = ROUND("price" * 0.8, 2)
     WHERE "price_test_swatch" IS NULL
       AND "sku" ILIKE 'FABRIC-%'`
  );
};
