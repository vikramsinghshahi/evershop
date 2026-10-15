import { error } from '../../../../lib/log/logger.js';
import type { EventData } from '../../../../types/event.js';
import { recordOrderCommissions } from '../../services/ledger.js';

export default async function recordDesignerCommission(order: EventData<'order_placed'>) {
  try {
    await recordOrderCommissions(order.order_id);
  } catch (failure) {
    error(failure);
  }
}
