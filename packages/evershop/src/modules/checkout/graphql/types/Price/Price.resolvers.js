import { getActiveLocale } from '../../../../../lib/locale/localeContext.js';
import { getShopCurrency } from '../../../../fabric/services/shopCurrencyContext.js';
import { getStoreCurrency } from '../../../../setting/services/setting.js';

function displayCurrency(argument, context) {
  if (argument) {
    return argument;
  }
  if (context && typeof context.orderCurrency === 'string' && context.orderCurrency) {
    return context.orderCurrency;
  }
  return getShopCurrency() || getStoreCurrency();
}

export default {
  Price: {
    value: (rawPrice) => parseFloat(rawPrice), // TODO: Format for decimal value?
    currency: (_, { currency }, context) => displayCurrency(currency, context),
    text: (rawPrice, { currency }, context) => {
      const price = parseFloat(rawPrice); // TODO: Format for decimal value?
      const curr = displayCurrency(currency, context);
      // The REQUEST locale (URL prefix / X-Locale / adminLanguage), falling back to the
      // `storeLanguage` admin setting. Was `getConfig('shop.language')`, which ignored both
      // the language the shopper is browsing in and the language the admin picked.
      const language = getActiveLocale();
      return new Intl.NumberFormat(language, {
        style: 'currency',
        currency: curr
      }).format(price);
    }
  }
};
