import { buildFilterFromUrl, FilterInput } from '../../../../../lib/util/buildFilterFromUrl.js';
import { toPrice } from '../../../../checkout/services/toPrice.js';
import { getCategoryTree } from '../../../services/getCategoryTree.js';
import { getStoreFilterableAttributes } from '../../../services/getFilterableAttributes.js';
import { getProductsBaseQuery } from '../../../services/getProductsBaseQuery.js';
import { getStorePriceRange } from '../../../services/getStorePriceRange.js';
import { ProductCollection } from '../../../services/ProductCollection.js';

/**
 * The `/products` listing — a category page without the category.
 *
 * Route-gated exactly like `Query.currentCategory` and `Query.productSearch`:
 * the field only resolves on its own route, so the merged per-route query of
 * any other page cannot accidentally pull a whole store-wide collection.
 * The fabric shop is the Fabrics category page, not the store homepage.
 */

interface ProductListingParent {
  filters: FilterInput[];
}

export default {
  Query: {
    productListing: async (
      _: unknown,
      __: unknown,
      {
        currentRoute,
        currentUrl
      }: {
        currentRoute?: { id?: string };
        currentUrl: string;
      }
    ): Promise<ProductListingParent | null> => {
      if (currentRoute?.id !== 'productListing') {
        return null;
      }
      return {
        filters: buildFilterFromUrl(currentUrl)
      };
    }
  },

  ProductListing: {
    products: async (
      parent: ProductListingParent,
      { filters = [] }: { filters?: FilterInput[] }
    ) => {
      // Status, visibility, stock, variant collapsing, keyword, price,
      // attribute filters, sort and pagination come from ProductCollection.
      const root = new ProductCollection(getProductsBaseQuery());
      await root.init([...parent.filters, ...filters], false);
      return root;
    },

    availableAttributes: () => getStoreFilterableAttributes(),

    priceRange: async () => {
      const { min, max } = await getStorePriceRange();
      return {
        min,
        max,
        minText: toPrice(String(min), true),
        maxText: toPrice(String(max), true)
      };
    },

    categories: () => getCategoryTree()
  }
};
