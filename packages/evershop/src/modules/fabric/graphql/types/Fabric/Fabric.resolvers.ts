import { select } from '@evershop/postgres-query-builder';
import { Pool } from 'pg';
import { toPrice } from '../../../../checkout/services/toPrice.js';
import { FABRIC_SWATCHES } from '../../../services/printScale.js';

interface FabricRow {
  sku: string;
  uuid: string;
  price: string;
  name: string;
  summary: string | null;
  url: string | null;
}

export default {
  Query: {
    fabrics: async (_root: unknown, _args: unknown, { pool }: { pool: Pool }) => {
      const query = select('product.sku')
        .select('product.uuid')
        .select('product.price')
        .select('product_description.name')
        .select('product_description.short_description', 'summary')
        .select('url_rewrite.request_path', 'url');
      query
        .from('product')
        .innerJoin('product_description')
        .on(
          'product.product_id',
          '=',
          'product_description.product_description_product_id'
        );
      query
        .leftJoin('url_rewrite')
        .on('url_rewrite.entity_uuid', '=', 'product.uuid');
      query.where('product.sku', 'LIKE', 'FABRIC-%');
      query.andWhere('product.status', '=', true);
      query.andWhere('product.visibility', '=', true);
      query.orderBy('product_description.name', 'ASC');
      const rows = (await query.execute(pool)) as FabricRow[];
      return rows.map((row) => ({
        name: row.name,
        sku: row.sku,
        url: row.url || `/product/${row.uuid}`,
        price: toPrice(String(row.price), true),
        summary: row.summary,
        swatch: FABRIC_SWATCHES[row.sku] || '#d6d3d1'
      }));
    }
  }
};
