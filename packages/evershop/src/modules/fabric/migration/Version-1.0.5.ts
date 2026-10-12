import { execute } from '@evershop/postgres-query-builder';
import type { PoolClient } from 'pg';

/**
 * The catalog price stays the India price. `export_margin` is the percent
 * added only when the shopper pays in another currency. The cart and the
 * order remember how many rupees one unit of the charge currency was worth.
 */
export default async (connection: PoolClient) => {
  await execute(
    connection,
    `ALTER TABLE "product"
       ADD COLUMN IF NOT EXISTS "export_margin" decimal(12,4) DEFAULT NULL`
  );
  await execute(
    connection,
    `ALTER TABLE "cart"
       ADD COLUMN IF NOT EXISTS "exchange_rate" decimal(12,4) DEFAULT NULL`
  );
  await execute(
    connection,
    `ALTER TABLE "order"
       ADD COLUMN IF NOT EXISTS "exchange_rate" decimal(12,4) DEFAULT NULL`
  );
  await execute(
    connection,
    `ALTER TABLE "cart_item"
       ADD COLUMN IF NOT EXISTS "export_margin" decimal(12,4) DEFAULT NULL`
  );
  await execute(
    connection,
    `ALTER TABLE "order_item"
       ADD COLUMN IF NOT EXISTS "export_margin" decimal(12,4) DEFAULT NULL`
  );
  await execute(
    connection,
    `INSERT INTO "setting" ("name", "value", "is_json")
     VALUES
       ('exchangeRateUsd', '83', FALSE),
       ('exchangeRateEur', '90', FALSE),
       ('exchangeRateAud', '54', FALSE),
       ('exchangeRateGbp', '105', FALSE),
       ('defaultExportMargin', '20', FALSE)
     ON CONFLICT ("name") DO NOTHING`
  );
};
