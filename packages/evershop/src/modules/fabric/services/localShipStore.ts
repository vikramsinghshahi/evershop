import type { PoolClient } from 'pg';
import { pool } from '../../../lib/postgres/connection.js';
import {
  LOCAL_SERVICES,
  quoteLocalShip,
  type LocalBandKind,
  type LocalRateRow,
  type LocalService,
  type LocalShipQuote
} from './localShipQuote.js';
import { FABRIC_SHIP_PROVIDER } from './shipStore.js';

export const INDIA_ZONE_NAME = 'India domestic';

interface Queryable {
  query(
    text: string,
    values?: unknown[]
  ): Promise<{ rows: Array<Record<string, unknown>> }>;
}

function readService(value: unknown): LocalService | null {
  if (value === 'lite' || value === 'plus' || value === 'prime') {
    return value;
  }
  return null;
}

function readBand(value: unknown): LocalBandKind | null {
  if (value === 'slab' || value === 'per_kg') {
    return value;
  }
  return null;
}

export async function loadLocalShipRates(
  connection: Queryable = pool
): Promise<LocalRateRow[]> {
  const result = await connection.query(
    `SELECT service, band, weight_kg, amount_inr
     FROM fabric_local_ship_rate
     ORDER BY service, band, weight_kg`
  );
  const rates: LocalRateRow[] = [];
  for (const row of result.rows) {
    const service = readService(row.service);
    const band = readBand(row.band);
    if (!service || !band) {
      continue;
    }
    rates.push({
      service,
      band,
      weightKg: Number(row.weight_kg),
      amountInr: Number(row.amount_inr)
    });
  }
  return rates;
}

/** One quote per service that has a price for this weight. */
export async function quoteIndiaShip(
  weightKg: number,
  connection: Queryable = pool
): Promise<LocalShipQuote[]> {
  const rates = await loadLocalShipRates(connection);
  const quotes: LocalShipQuote[] = [];
  for (const service of LOCAL_SERVICES) {
    const quote = quoteLocalShip(weightKg, service.code, rates);
    if (quote) {
      quotes.push(quote);
    }
  }
  return quotes;
}

/**
 * Makes India reachable by the fabric provider. Adds a zone and attaches
 * the provider. Does not remove countries, rates, or providers anywhere else.
 */
export async function syncIndiaZone(connection: PoolClient): Promise<void> {
  await connection.query(
    `INSERT INTO shipping_zone (name)
     SELECT $1::varchar
     WHERE NOT EXISTS (
       SELECT 1 FROM shipping_zone WHERE name = $1::varchar
     )`,
    [INDIA_ZONE_NAME]
  );
  const zone = await connection.query(
    `SELECT shipping_zone_id FROM shipping_zone WHERE name = $1 ORDER BY shipping_zone_id LIMIT 1`,
    [INDIA_ZONE_NAME]
  );
  const zoneId = zone.rows[0]?.shipping_zone_id;
  if (zoneId == null) {
    throw new Error('India shipping zone was not created');
  }
  await connection.query(
    `INSERT INTO shipping_zone_country (zone_id, country)
     VALUES ($1, 'IN')
     ON CONFLICT ON CONSTRAINT "ZONE_COUNTRY_UNIQUE" DO NOTHING`,
    [zoneId]
  );
  await connection.query(
    `INSERT INTO shipping_zone_provider (zone_id, provider_code, is_enabled)
     VALUES ($1, $2, TRUE)
     ON CONFLICT ON CONSTRAINT "ZONE_PROVIDER_CODE_UNIQUE" DO NOTHING`,
    [zoneId, FABRIC_SHIP_PROVIDER]
  );
}
