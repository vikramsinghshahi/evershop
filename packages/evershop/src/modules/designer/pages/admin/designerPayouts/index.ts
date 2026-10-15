import type { EvershopRequest } from '../../../../../types/request.js';
import { setPageMetaInfo } from '../../../../cms/services/pageMetaInfo.js';

export default (request: EvershopRequest) => {
  setPageMetaInfo(request, { title: 'Designer payouts', description: 'Designer wallet balances' });
};
