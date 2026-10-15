import { setPageMetaInfo } from '../../../../cms/services/pageMetaInfo.js';
import { setContextValue } from '../../../../graphql/services/contextHelper.js';

function param(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 80) : null;
}

export default (request, response, next) => {
  const query = request.query ?? {};
  const page = Number.parseInt(String(query.page ?? '1'), 10);
  setContextValue(request, 'galleryCategory', param(query.category));
  setContextValue(request, 'galleryColor', param(query.color));
  setContextValue(request, 'galleryDesigner', param(query.designer));
  setContextValue(request, 'galleryQuery', param(query.q));
  setContextValue(request, 'gallerySort', param(query.sort));
  setContextValue(request, 'galleryPage', Number.isFinite(page) && page > 0 ? Math.min(page, 1000) : 1);
  setPageMetaInfo(request, {
    title: 'Designs to print on fabric',
    description: 'Prints by independent designers, ready to print on the fabric of your choice'
  });
  next();
};
