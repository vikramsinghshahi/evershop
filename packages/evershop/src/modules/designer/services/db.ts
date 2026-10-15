import type { PoolClient } from 'pg';
import { getConnection, pool } from '../../../lib/postgres/connection.js';

export class DesignerError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function rows<T = Record<string, any>>(
  sql: string,
  params: unknown[] = [],
  client: PoolClient | typeof pool = pool
): Promise<T[]> {
  const result = await client.query(sql, params);
  return result.rows as T[];
}

export async function one<T = Record<string, any>>(
  sql: string,
  params: unknown[] = [],
  client: PoolClient | typeof pool = pool
): Promise<T | null> {
  const result = await rows<T>(sql, params, client);
  return result[0] ?? null;
}

/** Runs `work` in its own transaction on a dedicated client. */
export async function inTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getConnection();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export function money(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
}
