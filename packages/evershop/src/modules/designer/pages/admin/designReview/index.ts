import type { EvershopRequest } from '../../../../../types/request.js';
import { setPageMetaInfo } from '../../../../cms/services/pageMetaInfo.js';

export default (request: EvershopRequest) => {
  setPageMetaInfo(request, { title: 'Design review', description: 'Designs sent for review' });
};
