import { setPageMetaInfo } from '../../../../cms/services/pageMetaInfo.js';

export default (request, response, next) => {
  setPageMetaInfo(request, {
    title: 'Apply fabric',
    description: 'Apply a design to a product and download the result.'
  });
  next();
};
