import { quoteCatalogAmount } from '../../../../../fabric/services/shopCurrencyRates.js';

export default {
  Product: {
    price: (product) => {
      const price = quoteCatalogAmount(parseFloat(product.price), product);
      return {
        regular: price,
        special: price // TODO: implement special price
      };
    }
  }
};
