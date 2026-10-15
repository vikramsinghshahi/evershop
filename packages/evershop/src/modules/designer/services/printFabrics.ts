import { localizeUrl } from '../../../lib/locale/localeContext.js';
import { buildUrl } from '../../../lib/router/buildUrl.js';
import { FABRIC_SKU_PREFIX } from '../../fabric/services/printScale.js';
import { rows } from './db.js';

export interface PrintFabric {
  name: string;
  url: string;
  image: string | null;
}

/** Fabrics a gallery design can be printed on. */
export async function printFabrics(): Promise<PrintFabric[]> {
  const found = await rows<{
    uuid: string;
    name: string;
    request_path: string | null;
    image: string | null;
  }>(
    `SELECT p."uuid", d."name", u."request_path",
            (SELECT COALESCE(i."thumb_image", i."origin_image")
               FROM "product_image" i
              WHERE i."product_image_product_id" = p."product_id"
              ORDER BY i."is_main" DESC NULLS LAST, i."product_image_id"
              LIMIT 1) AS image
       FROM "product" p
       JOIN "product_description" d ON d."product_description_product_id" = p."product_id"
       LEFT JOIN "url_rewrite" u ON u."entity_uuid" = p."uuid" AND u."entity_type" = 'product'
      WHERE p."sku" LIKE $1 AND p."status" = TRUE AND p."visibility" = TRUE
      ORDER BY d."name"
      LIMIT 50`,
    [`${FABRIC_SKU_PREFIX}%`]
  );
  return found.map((row) => ({
    name: row.name,
    url: localizeUrl(row.request_path || buildUrl('productView', { uuid: row.uuid })),
    image: row.image
  }));
}
