import { buildUrl } from '../../../../../lib/router/buildUrl.js';
import type { EvershopResponse } from '../../../../../types/response.js';
import { setPageMetaInfo } from '../../../../cms/services/pageMetaInfo.js';

export default (request, response: EvershopResponse, next) => {
  if (!request.isCustomerLoggedIn()) {
    response.redirect(`${buildUrl('login')}?redirect=${encodeURIComponent(buildUrl('designerDashboard'))}`);
    return;
  }
  setPageMetaInfo(request, {
    title: 'Designer dashboard',
    description: 'Upload designs, track their review and see your commission'
  });
  next();
};
