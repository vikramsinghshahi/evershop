import type { EvershopRequest } from '../../../../../types/request.js';
import { setPageMetaInfo } from '../../../../cms/services/pageMetaInfo.js';

export default (request: EvershopRequest) => {
  setPageMetaInfo(request, { title: 'Designers', description: 'Designer accounts' });
};
