import { execute } from '@evershop/postgres-query-builder';
import type { PoolClient } from 'pg';
import { LOCAL_SHIP_SEED } from '../services/localShipQuote.js';
import { syncIndiaZone } from '../services/localShipStore.js';

/**
 * DTDC Lite, Plus, and Prime for addresses in India. Existing rows are left
 * alone so an admin edit survives a restart. Export rates are not touched.
 * The India zone is added beside any zone that already lists India.
 */
export default async (connection: PoolClient) => {
  await execute(
    connection,
    `CREATE TABLE IF NOT EXISTS "fabric_local_ship_rate" (
      "service" varchar(8) NOT NULL CHECK ("service" IN ('lite', 'plus', 'prime')),
      "band" varchar(8) NOT NULL CHECK ("band" IN ('slab', 'per_kg')),
      "weight_kg" numeric(6,1) NOT NULL,
      "amount_inr" numeric(12,2) NOT NULL CHECK ("amount_inr" >= 0),
      PRIMARY KEY ("service", "band", "weight_kg")
    )`
  );

  for (const rate of LOCAL_SHIP_SEED) {
    await connection.query(
      `INSERT INTO fabric_local_ship_rate (service, band, weight_kg, amount_inr)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (service, band, weight_kg) DO NOTHING`,
      [rate.service, rate.band, rate.weightKg, rate.amountInr]
    );
  }

  await syncIndiaZone(connection);

  // A zero-cost core method on the India zone would stay cheaper than every
  // DTDC price. Turn that rate off. Export zones and any priced rate stay.
  await connection.query(
    `UPDATE core_shipping_method_rate
     SET is_enabled = FALSE
     WHERE cost = 0
       AND zone_id IN (
         SELECT shipping_zone_id FROM shipping_zone WHERE name = 'India'
       )`
  );
};
