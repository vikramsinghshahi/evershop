import { pool } from '../../../lib/postgres/connection.js';
import {
  getSetting,
  getSettingSync,
  refreshSetting
} from '../../setting/services/setting.js';
import {
  DEFAULT_SHIP_SURCHARGE,
  normalizeShipSurcharge,
  readShipSurcharge,
  SHIP_SURCHARGE_SETTING
} from './shipSurcharge.js';

/** The percent checkout adds to the export card price. */
export function storeShipSurcharge(): number {
  return readShipSurcharge(getSettingSync(SHIP_SURCHARGE_SETTING, DEFAULT_SHIP_SURCHARGE));
}

export async function loadShipSurcharge(): Promise<number> {
  return readShipSurcharge(await getSetting(SHIP_SURCHARGE_SETTING, DEFAULT_SHIP_SURCHARGE));
}

export async function saveShipSurcharge(input: unknown): Promise<number> {
  const percent = normalizeShipSurcharge(input);
  await pool.query(
    `INSERT INTO "setting" ("name", "value", "is_json")
     VALUES ($1, $2, FALSE)
     ON CONFLICT ("name") DO UPDATE
     SET "value" = EXCLUDED."value", "is_json" = FALSE`,
    [SHIP_SURCHARGE_SETTING, String(percent)]
  );
  await refreshSetting();
  return percent;
}
