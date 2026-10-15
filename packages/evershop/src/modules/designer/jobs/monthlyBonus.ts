import { error } from '../../../lib/log/logger.js';
import { grantMonthlyBonuses } from '../services/ledger.js';

export default async function monthlyBonus() {
  try {
    await grantMonthlyBonuses();
  } catch (failure) {
    error(failure);
  }
}
