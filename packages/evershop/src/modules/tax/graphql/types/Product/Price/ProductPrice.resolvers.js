import { toPrice } from '../../../../../../modules/checkout/services/toPrice.js';
import { quoteCatalogAmount } from '../../../../../../modules/fabric/services/shopCurrencyRates.js';

export default {
  Product: {
    price: async (product) => {
      // This resolver is the one that wins the merge (it loads after catalog).
      // Quote after tax rounding so the storefront shows the shopper currency.
      const price = quoteCatalogAmount(toPrice(product.price), product);
      return {
        regular: price,
        special: price // TODO: implement special price
      };
    }
  }
};
