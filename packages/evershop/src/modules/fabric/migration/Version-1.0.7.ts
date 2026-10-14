import { execute } from '@evershop/postgres-query-builder';
import type { PoolClient } from 'pg';

/**
 * Export shipping surcharge, in percent, added to the card price at checkout
 * to cover Indian GST. An admin edit survives a restart.
 */
export default async (connection: PoolClient) => {
  await execute(
    connection,
    `INSERT INTO "setting" ("name", "value", "is_json")
     VALUES ('exportShippingSurcharge', '80', FALSE)
     ON CONFLICT ("name") DO NOTHING`
  );
};
