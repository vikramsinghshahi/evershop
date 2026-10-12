import { execute } from '@evershop/postgres-query-builder';
import type { PoolClient } from 'pg';
import { SHIP_COUNTRIES, SHIP_RATES } from '../services/shipCardSeed.js';
import { syncExportZone } from '../services/shipStore.js';

/**
 * Zone and weight card from the courier sheets. Existing rows are left
 * alone so an admin edit survives a restart. Checkout only sees a country
 * after it is also on the Export shipping zone.
 */
export default async (connection: PoolClient) => {
  await execute(
    connection,
    `CREATE TABLE IF NOT EXISTS "fabric_ship_country" (
      "country_code" varchar(2) PRIMARY KEY,
      "country_name" varchar(120) NOT NULL,
      "zone" smallint NOT NULL CHECK ("zone" BETWEEN 1 AND 13)
    )`
  );
  await execute(
    connection,
    `CREATE TABLE IF NOT EXISTS "fabric_ship_rate" (
      "band" varchar(8) NOT NULL CHECK ("band" IN ('slab', 'per_kg')),
      "weight_kg" numeric(6,1) NOT NULL,
      "zone" smallint NOT NULL CHECK ("zone" BETWEEN 1 AND 13),
      "amount_inr" numeric(12,2) NOT NULL CHECK ("amount_inr" >= 0),
      PRIMARY KEY ("band", "weight_kg", "zone")
    )`
  );

  for (const country of SHIP_COUNTRIES) {
    await connection.query(
      `INSERT INTO fabric_ship_country (country_code, country_name, zone)
       VALUES ($1, $2, $3)
       ON CONFLICT (country_code) DO NOTHING`,
      [country.countryCode, country.countryName, country.zone]
    );
  }
  for (const rate of SHIP_RATES) {
    await connection.query(
      `INSERT INTO fabric_ship_rate (band, weight_kg, zone, amount_inr)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (band, weight_kg, zone) DO NOTHING`,
      [rate.band, rate.weightKg, rate.zone, rate.amountInr]
    );
  }

  await syncExportZone(
    connection,
    SHIP_COUNTRIES.map((country) => country.countryCode)
  );
};
