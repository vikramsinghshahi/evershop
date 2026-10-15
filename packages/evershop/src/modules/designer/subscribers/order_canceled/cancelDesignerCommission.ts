import { error } from '../../../../lib/log/logger.js';
import type { EventData } from '../../../../types/event.js';
import { cancelOrderCommissions } from '../../services/ledger.js';

export default async function cancelDesignerCommission(data: EventData<'order_canceled'>) {
  try {
    await cancelOrderCommissions(data.orderId);
  } catch (failure) {
    error(failure);
  }
}
