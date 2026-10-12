import { hookBefore } from '../../lib/util/hookable.js';
import { addProcessor } from '../../lib/util/registry.js';
import { normalizeFabricSpecs } from './services/fabricSpecs.js';
import { normalizeOrderSizePrices } from './services/orderSize.js';
import { normalizePrintFee } from './services/printFee.js';
import { registerCurrencyOnCart, registerCurrencyOnCartItem } from './services/shopCurrencyCart.js';
import { normalizeExportMargin } from './services/shopCurrency.js';
import { registerPrintFeeOnCartItem } from './services/printFeeCart.js';
import { registerFabricShipping } from './services/fabricShipping.js';
import { normalizeSaleFields } from './services/saleUnit.js';

function normalizeProductFields(data: Record<string, unknown>): void {
  normalizeSaleFields(data);
  normalizePrintFee(data);
  normalizeOrderSizePrices(data);
  normalizeExportMargin(data);
  normalizeFabricSpecs(data);
}

export default function bootstrap() {
  hookBefore('updateProduct', (_uuid, data) => {
    normalizeProductFields(data);
  });
  hookBefore('createProduct', (data) => {
    normalizeProductFields(data);
  });
  addProcessor('cartItemFields', registerPrintFeeOnCartItem, 10);
  addProcessor('cartItemFields', registerCurrencyOnCartItem, 20);
  addProcessor('cartFields', registerCurrencyOnCart, 10);
  registerFabricShipping();
}
