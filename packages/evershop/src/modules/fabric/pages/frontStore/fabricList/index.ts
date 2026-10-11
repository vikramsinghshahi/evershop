import { setPageMetaInfo } from '../../../../cms/services/pageMetaInfo.js';

export default (request, _response, next) => {
  setPageMetaInfo(request, {
    title: 'Fabrics',
    description:
      'Viscose, cotton and rayon. Set the image scale on the cloth you choose; it stays on the line through checkout.'
  });
  next();
};
