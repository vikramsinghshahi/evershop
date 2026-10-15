import { setPageMetaInfo } from '../../../../cms/services/pageMetaInfo.js';
import { setContextValue } from '../../../../graphql/services/contextHelper.js';
import { publicProfileBySlug } from '../../../services/profiles.js';

export default async (request, response, next) => {
  try {
    const slug = String(request.params.slug || '').toLowerCase();
    const profile = /^[a-z0-9-]{1,60}$/.test(slug) ? await publicProfileBySlug(slug) : null;
    if (!profile) {
      response.status(404);
      next();
      return;
    }
    const page = Number.parseInt(String(request.query?.page ?? '1'), 10);
    setContextValue(request, 'designerSlug', profile.slug);
    setContextValue(request, 'galleryPage', Number.isFinite(page) && page > 0 ? Math.min(page, 1000) : 1);
    setPageMetaInfo(request, {
      title: `${profile.display_name} – designs`,
      description: profile.bio?.slice(0, 160) || `Fabric prints designed by ${profile.display_name}`
    });
    next();
  } catch (failure) {
    next(failure);
  }
};
