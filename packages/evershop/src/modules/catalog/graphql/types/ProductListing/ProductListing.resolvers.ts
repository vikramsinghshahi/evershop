import { buildFilterFromUrl, FilterInput } from '../../../../../lib/util/buildFilterFromUrl.js';
import { toPrice } from '../../../../checkout/services/toPrice.js';
import { getCategoryTree } from '../../../services/getCategoryTree.js';
import {
  getFilterableAttributes,
  getStoreFilterableAttributes
} from '../../../services/getFilterableAttributes.js';
import { getProductsBaseQuery } from '../../../services/getProductsBaseQuery.js';
import { getProductsByCategoryBaseQuery } from '../../../services/getProductsByCategoryBaseQuery.js';
import { getStorePriceRange } from '../../../services/getStorePriceRange.js';
import { ProductCollection } from '../../../services/ProductCollection.js';

/**
 * The `/products` listing — a category page without the category.
 *
 * Route-gated exactly like `Query.currentCategory` and `Query.productSearch`:
 * the field only resolves on its own route, so the merged per-route query of
 * any other page cannot accidentally pull a whole store-wide collection.
 *
 * The homepage is the fabric shop. Fabrics are whatever products sit in the
 * Fabrics category (the ones a merchant adds), not a hard-coded sku prefix.
 */

interface ProductListingParent {
  filters: FilterInput[];
  /** Homepage is the fabric catalog. `/products` stays the whole store. */
  homepage: boolean;
  /** Fabrics category id, when the homepage can find it. */
  fabricCategoryId: number | null;
}

interface DbPool {
  query: (
    sql: string,
    params?: unknown[]
  ) => Promise<{ rows: Array<{ category_id: number }> }>;
}

const FABRICS_URL_KEY = 'fabrics';

async function findFabricsCategoryId(pool: DbPool): Promise<number | null> {
  const { rows } = await pool.query(
    `SELECT category.category_id
     FROM category
     INNER JOIN category_description
       ON category_description.category_description_category_id = category.category_id
     WHERE category_description.url_key = $1
       AND category.status = true
     LIMIT 1`,
    [FABRICS_URL_KEY]
  );
  const id = rows[0]?.category_id;
  return id === undefined || id === null ? null : Number(id);
}

export default {
  Query: {
    productListing: async (
      _: unknown,
      __: unknown,
      {
        currentRoute,
        currentUrl,
        pool
      }: {
        currentRoute?: { id?: string };
        currentUrl: string;
        pool: DbPool;
      }
    ): Promise<ProductListingParent | null> => {
      const routeId = currentRoute?.id;
      if (routeId !== 'productListing' && routeId !== 'homepage') {
        return null;
      }
      const homepage = routeId === 'homepage';
      return {
        filters: buildFilterFromUrl(currentUrl),
        homepage,
        fabricCategoryId: homepage ? await findFabricsCategoryId(pool) : null
      };
    }
  },

  ProductListing: {
    products: async (
      parent: ProductListingParent,
      { filters = [] }: { filters?: FilterInput[] }
    ) => {
      // `/products` is the whole catalog. The homepage is the Fabrics category,
      // including anything a merchant adds there. Status, visibility, stock,
      // variant collapsing, keyword, price, attribute filters, sort and
      // pagination still come from ProductCollection.
      const query = parent.fabricCategoryId
        ? await getProductsByCategoryBaseQuery(parent.fabricCategoryId, true)
        : getProductsBaseQuery();
      if (parent.homepage && !parent.fabricCategoryId) {
        query.andWhere('product.product_id', '=', 0);
      }
      const root = new ProductCollection(query);
      await root.init([...parent.filters, ...filters], false);
      return root;
    },

    availableAttributes: (parent: ProductListingParent) =>
      parent.fabricCategoryId
        ? getFilterableAttributes(parent.fabricCategoryId)
        : getStoreFilterableAttributes(),

    priceRange: async (
      parent: ProductListingParent,
      _: unknown,
      { pool }: { pool: DbPool }
    ) => {
      if (parent.fabricCategoryId) {
        const query = await getProductsByCategoryBaseQuery(
          parent.fabricCategoryId,
          true
        );
        query
          .select('MIN(product.price)', 'min')
          .select('MAX(product.price)', 'max');
        const result = await query.load(pool);
        const min = result?.min || 0;
        const max = result?.max || 0;
        return {
          min,
          max,
          minText: toPrice(min, true),
          maxText: toPrice(max, true)
        };
      }
      const { min, max } = await getStorePriceRange();
      return {
        min,
        max,
        minText: toPrice(String(min), true),
        maxText: toPrice(String(max), true)
      };
    },

    // A store-wide category facet on the fabric homepage would offer
    // Accessories and then return an empty grid. Child categories, when a
    // merchant adds them, are reached from the Fabrics category page.
    categories: (parent: ProductListingParent) =>
      parent.fabricCategoryId ? [] : getCategoryTree()
  }
};
