import type { EvershopRequest } from '../../../../types/request.js';
import { liveDesigners, listLiveDesigns } from '../../services/designs.js';
import { sendFailure, sendOk } from '../../services/http.js';
import { publicDesign } from '../../services/present.js';

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 80) : null;
}

/** Live designs for the fabric picker. Anyone can read it. */
export default async function designCatalog(request: EvershopRequest, response, next) {
  try {
    const query = request.query ?? {};
    const result = await listLiveDesigns({
      category: text(query.category),
      color: text(query.color),
      designer: text(query.designer),
      uuid: text(query.id),
      q: text(query.q),
      sort: text(query.sort),
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 12
    });
    const designers = query.withDesigners === '1' ? await liveDesigners() : undefined;
    sendOk(response, {
      items: result.items.map(publicDesign),
      total: result.total,
      page: result.page,
      limit: result.limit,
      designers: designers?.map((designer) => ({
        slug: designer.slug,
        name: designer.display_name,
        count: designer.count
      }))
    });
  } catch (failure) {
    sendFailure(response, failure);
  }
}
