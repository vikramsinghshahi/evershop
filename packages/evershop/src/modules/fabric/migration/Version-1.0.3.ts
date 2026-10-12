import { execute } from '@evershop/postgres-query-builder';
import type { PoolClient } from 'pg';
import { DEFAULT_PRINT_FEE } from '../services/printFee.js';

/**
 * Printing fee per unit, on the fabric itself. Blank on accessories.
 * Existing cloths start at the basic fee; an admin can change each one.
 */
export default async (connection: PoolClient) => {
  await execute(
    connection,
    `ALTER TABLE "product"
       ADD COLUMN IF NOT EXISTS "print_fee" decimal(12,4) DEFAULT NULL`
  );
  await execute(
    connection,
    `UPDATE "product"
     SET "print_fee" = ${DEFAULT_PRINT_FEE}
     WHERE "print_fee" IS NULL
       AND "sku" ILIKE 'FABRIC-%'`
  );
};
