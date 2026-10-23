import { setPageMetaInfo } from '../../../../cms/services/pageMetaInfo.js';

export default (request) => {
  setPageMetaInfo(request, {
    title: 'India rates',
    description: 'DTDC prices for addresses in India'
  });
};
