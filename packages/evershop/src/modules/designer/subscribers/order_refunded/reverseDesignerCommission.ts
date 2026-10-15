import { error } from '../../../../lib/log/logger.js';
import type { EventData } from '../../../../types/event.js';
import { reverseRefundedCommissions } from '../../services/ledger.js';

export default async function reverseDesignerCommission(data: EventData<'order_refunded'>) {
  try {
    await reverseRefundedCommissions(data);
  } catch (failure) {
    error(failure);
  }
}
