import { execute } from '@evershop/postgres-query-builder';
import type { PoolClient } from 'pg';

/**
 * Cloth specs for the fabric card: color, count, construction, width, GSM.
 * Blank on every product until an admin fills them in.
 */
export default async (connection: PoolClient) => {
  await execute(
    connection,
    `ALTER TABLE "product"
       ADD COLUMN IF NOT EXISTS "fabric_color" varchar(80) DEFAULT NULL,
       ADD COLUMN IF NOT EXISTS "fabric_count" varchar(80) DEFAULT NULL,
       ADD COLUMN IF NOT EXISTS "fabric_construction" varchar(80) DEFAULT NULL,
       ADD COLUMN IF NOT EXISTS "fabric_width" varchar(80) DEFAULT NULL,
       ADD COLUMN IF NOT EXISTS "fabric_gsm" varchar(80) DEFAULT NULL`
  );
};
