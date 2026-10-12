import { insert, select } from '@evershop/postgres-query-builder';
import { error, info } from '../../../lib/log/logger.js';
import { pool } from '../../../lib/postgres/connection.js';
import { hashPassword } from '../../../lib/util/passwordHelper.js';

/**
 * Creates the first admin when ADMIN_EMAIL and ADMIN_PASSWORD are set and
 * that email is not already in admin_user. Used by the Render trial, which
 * has no shell. Later deploys leave an existing user alone, so a password
 * change in admin is kept.
 */
export async function ensureAdminUser(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    return;
  }
  if (password.length < 8) {
    error(
      'ADMIN_PASSWORD must be at least 8 characters. Admin user was not created.'
    );
    return;
  }

  try {
    const existing = await select('admin_user_id')
      .from('admin_user')
      .where('email', '=', email)
      .load(pool);
    if (existing) {
      return;
    }

    await insert('admin_user')
      .given({
        status: true,
        email,
        password: hashPassword(password),
        full_name: process.env.ADMIN_NAME?.trim() || 'Admin'
      })
      .execute(pool);
    info(`Created admin user ${email}`);
  } catch (e) {
    error(e);
  }
}
