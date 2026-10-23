import { commit, rollback, startTransaction } from '@evershop/postgres-query-builder';
import type { PoolClient } from 'pg';
import { getConnection } from '../../../lib/postgres/connection.js';
import {
  localService,
  localWeightKg,
  type LocalBandKind,
  type LocalRateRow
} from './localShipQuote.js';
import { syncIndiaZone } from './localShipStore.js';

export class LocalShipError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LocalShipError';
  }
}

function money(value: unknown): number {
  const amount = typeof value === 'number' ? value : Number(String(value).replace(/,/g, '').trim());
  if (!Number.isFinite(amount) || amount < 0) {
    throw new LocalShipError('A rate must be a rupee amount of zero or more');
  }
  return Math.round(amount * 100) / 100;
}

export function normalizeLocalRates(input: unknown): LocalRateRow[] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new LocalShipError('Add at least one India rate');
  }
  const seen = new Set<string>();
  const rates: LocalRateRow[] = [];
  for (const row of input) {
    const record = row as {
      service?: unknown;
      band?: unknown;
      weightKg?: unknown;
      amountInr?: unknown;
    };
    const service = localService(record?.service);
    if (!service) {
      throw new LocalShipError('A rate must be DTDC Lite, Plus, or Prime');
    }
    const band: LocalBandKind | null =
      record?.band === 'per_kg' ? 'per_kg' : record?.band === 'slab' ? 'slab' : null;
    if (!band) {
      throw new LocalShipError('A rate row must be a weight slab or a per-kilogram rate');
    }
    const weightKg = localWeightKg(band, Number(record.weightKg));
    if (weightKg == null) {
      throw new LocalShipError('That weight is not on the India card');
    }
    const key = `${service}:${band}:${weightKg}`;
    if (seen.has(key)) {
      throw new LocalShipError('Two rates share the same service and weight');
    }
    seen.add(key);
    rates.push({
      service,
      band,
      weightKg,
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

export async function saveLocalShipRates(input: unknown): Promise<void> {
  const rates = normalizeLocalRates(input);
  await inTransaction(async (connection) => {
    await connection.query(`DELETE FROM fabric_local_ship_rate`);
    for (const rate of rates) {
      await connection.query(
        `INSERT INTO fabric_local_ship_rate (service, band, weight_kg, amount_inr)
         VALUES ($1, $2, $3, $4)`,
        [rate.service, rate.band, rate.weightKg, rate.amountInr]
      );
    }
    await syncIndiaZone(connection);
  });
}
