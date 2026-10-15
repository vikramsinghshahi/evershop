import { error } from '../../../lib/log/logger.js';
import { releaseDueCommissions } from '../services/ledger.js';

export default async function releaseCommissions() {
  try {
    await releaseDueCommissions();
  } catch (failure) {
    error(failure);
  }
}
