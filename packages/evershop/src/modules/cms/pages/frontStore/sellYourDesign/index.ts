import { setPageMetaInfo } from '../../../services/pageMetaInfo.js';

export default (request, response, next) => {
  setPageMetaInfo(request, {
    title: 'Sell your design',
    description:
      'Register as a designer, upload your artwork, and earn 10% commission when a customer orders a print of your design.'
  });
  next();
};
