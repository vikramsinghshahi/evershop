import { commit, rollback, startTransaction } from '@evershop/postgres-query-builder';
import { COUNTRIES } from '../../../lib/address/data/countries.js';
import { getConnection } from '../../../lib/postgres/connection.js';
import type { PoolClient } from 'pg';
import { syncExportZone } from './shipStore.js';
import type { ShipBand } from './shipQuote.js';

const COUNTRY_CODES = new Set(COUNTRIES.map((country) => country.code));
const COUNTRY_NAMES = new Map(COUNTRIES.map((country) => [country.code, country.name]));

export class ShipCardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShipCardError';
  }
}

export interface CountryInput {
  countryCode: string;
  zone: number;
}

export interface RateInput {
  band: ShipBand;
  weightKg: number;
  zone: number;
  amountInr: number;
}

function zoneNumber(value: unknown): number {
  const zone = Number(value);
  if (!Number.isInteger(zone) || zone < 1 || zone > 13) {
    throw new ShipCardError('Zone must be a whole number from 1 to 13');
  }
  return zone;
}

function money(value: unknown): number {
  const amount = typeof value === 'number' ? value : Number(String(value).replace(/,/g, '').trim());
  if (!Number.isFinite(amount) || amount < 0) {
    throw new ShipCardError('A rate must be a rupee amount of zero or more');
  }
  return Math.round(amount * 100) / 100;
}

export function normalizeCountries(input: unknown): CountryInput[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new ShipCardError('Add at least one country');
  }
  const seen = new Set<string>();
  const countries: CountryInput[] = [];
  for (const row of input) {
    const record = row as { countryCode?: unknown; zone?: unknown };
    const countryCode = String(record?.countryCode ?? '').trim().toUpperCase();
    if (!COUNTRY_CODES.has(countryCode)) {
      throw new ShipCardError(`Unknown country ${countryCode || '(blank)'}`);
    }
    if (seen.has(countryCode)) {
      throw new ShipCardError(`${countryCode} is listed twice`);
    }
    seen.add(countryCode);
    countries.push({ countryCode, zone: zoneNumber(record.zone) });
  }
  return countries;
}

export function normalizeRates(input: unknown): RateInput[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new ShipCardError('Add at least one rate');
  }
  const seen = new Set<string>();
  const rates: RateInput[] = [];
  for (const row of input) {
    const record = row as {
      band?: unknown;
      weightKg?: unknown;
      zone?: unknown;
      amountInr?: unknown;
    };
    const band = record?.band === 'per_kg' ? 'per_kg' : record?.band === 'slab' ? 'slab' : null;
    if (!band) {
      throw new ShipCardError('A rate row must be a weight slab or a per-kilogram rate');
    }
    const weightKg = Number(record.weightKg);
    if (!Number.isFinite(weightKg) || weightKg <= 0) {
      throw new ShipCardError('A rate weight must be greater than zero');
    }
    const zone = zoneNumber(record.zone);
    const key = `${band}:${weightKg}:${zone}`;
    if (seen.has(key)) {
      throw new ShipCardError('Two rates share the same weight and zone');
    }
    seen.add(key);
    rates.push({
      band,
      weightKg: Math.round(weightKg * 10) / 10,
      zone,
      amountInr: money(record.amountInr)
    });
  }
  return rates;
}

async function inTransaction(work: (connection: PoolClient) => Promise<void>): Promise<void> {
  const connection = await getConnection();
  await startTransaction(connection);
  try {
    await work(connection);
    await commit(connection);
  } catch (error) {
    await rollback(connection);
    throw error;
  }
}

export async function saveShipCountries(input: unknown): Promise<void> {
  const countries = normalizeCountries(input);
  await inTransaction(async (connection) => {
    const codes = countries.map((country) => country.countryCode);
    await connection.query(
      `DELETE FROM fabric_ship_country WHERE NOT (country_code = ANY($1::varchar[]))`,
      [codes]
    );
    for (const country of countries) {
      await connection.query(
        `INSERT INTO fabric_ship_country (country_code, country_name, zone)
         VALUES ($1, $2, $3)
         ON CONFLICT (country_code) DO UPDATE
         SET zone = EXCLUDED.zone, country_name = EXCLUDED.country_name`,
        [country.countryCode, COUNTRY_NAMES.get(country.countryCode), country.zone]
      );
    }
    await syncExportZone(connection, codes);
  });
}

export async function saveShipRates(input: unknown): Promise<void> {
  const rates = normalizeRates(input);
  await inTransaction(async (connection) => {
    await connection.query(`DELETE FROM fabric_ship_rate`);
    for (const rate of rates) {
      await connection.query(
        `INSERT INTO fabric_ship_rate (band, weight_kg, zone, amount_inr)
         VALUES ($1, $2, $3, $4)`,
        [rate.band, rate.weightKg, rate.zone, rate.amountInr]
      );
    }
  });
}
