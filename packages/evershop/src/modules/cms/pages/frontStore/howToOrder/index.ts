import { setPageMetaInfo } from '../../../services/pageMetaInfo.js';

export default (request, response, next) => {
  setPageMetaInfo(request, {
    title: 'How To order',
    description:
      'Choose a fabric, add a print or buy the cloth plain, set the metres, and check out.'
  });
  next();
};
