import type { PoolClient } from 'pg';
import { pool } from '../../../lib/postgres/connection.js';
import {
  quoteShipInr,
  type ShipQuote,
  type ShipRateRow
} from './shipQuote.js';

const EXPORT_ZONE_NAME = 'Export';
export const FABRIC_SHIP_PROVIDER = 'fabric';

interface Queryable {
  query(
    text: string,
    values?: unknown[]
  ): Promise<{ rows: Array<Record<string, unknown>> }>;
}

export interface ShipCountryRow {
  countryCode: string;
  countryName: string;
  zone: number;
}

export async function loadShipCountries(
  connection: Queryable = pool
): Promise<ShipCountryRow[]> {
  const result = await connection.query(
    `SELECT country_code, country_name, zone
     FROM fabric_ship_country
     ORDER BY country_name`
  );
  return result.rows.map((row) => ({
    countryCode: String(row.country_code),
    countryName: String(row.country_name),
    zone: Number(row.zone)
  }));
}

export async function loadShipRates(
  connection: Queryable = pool
): Promise<ShipRateRow[]> {
  const result = await connection.query(
    `SELECT band, weight_kg, zone, amount_inr
     FROM fabric_ship_rate
     ORDER BY band, weight_kg, zone`
  );
  return result.rows.map((row) => ({
    band: row.band === 'per_kg' ? 'per_kg' : 'slab',
    weightKg: Number(row.weight_kg),
    zone: Number(row.zone),
    amountInr: Number(row.amount_inr)
  }));
}

export async function quoteCountryShip(
  countryCode: string,
  weightKg: number,
  connection: Queryable = pool
): Promise<ShipQuote | null> {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) {
    return null;
  }
  const country = await connection.query(
    `SELECT zone FROM fabric_ship_country WHERE country_code = $1`,
    [code]
  );
  const zone = Number(country.rows[0]?.zone);
  if (!Number.isInteger(zone)) {
    return null;
  }
  const rates = await loadShipRates(connection);
  return quoteShipInr(weightKg, zone, rates);
}

/**
 * The checkout zone list has to contain every country on the card, or the
 * rate is never asked. Countries taken off the card leave this zone only.
 */
export async function syncExportZone(
  connection: PoolClient,
  countryCodes: string[]
): Promise<void> {
  await connection.query(
    `INSERT INTO shipping_zone (name)
     SELECT $1::varchar
     WHERE NOT EXISTS (
       SELECT 1 FROM shipping_zone WHERE name = $1::varchar
     )`,
    [EXPORT_ZONE_NAME]
  );
  const zone = await connection.query(
    `SELECT shipping_zone_id FROM shipping_zone WHERE name = $1 ORDER BY shipping_zone_id LIMIT 1`,
    [EXPORT_ZONE_NAME]
  );
  const zoneId = zone.rows[0]?.shipping_zone_id;
  if (zoneId == null) {
    throw new Error('Export shipping zone was not created');
  }
  for (const code of countryCodes) {
    await connection.query(
      `INSERT INTO shipping_zone_country (zone_id, country)
       VALUES ($1, $2)
       ON CONFLICT ON CONSTRAINT "ZONE_COUNTRY_UNIQUE" DO NOTHING`,
      [zoneId, code]
    );
  }
  await connection.query(
    `DELETE FROM shipping_zone_country
     WHERE zone_id = $1 AND NOT (country = ANY($2::varchar[]))`,
    [zoneId, countryCodes]
  );
  await connection.query(
    `INSERT INTO shipping_zone_provider (zone_id, provider_code, is_enabled)
     VALUES ($1, $2, TRUE)
     ON CONFLICT ON CONSTRAINT "ZONE_PROVIDER_CODE_UNIQUE" DO NOTHING`,
    [zoneId, FABRIC_SHIP_PROVIDER]
  );
}
