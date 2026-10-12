import { hookBefore } from '../../lib/util/hookable.js';
import { addProcessor } from '../../lib/util/registry.js';
import { normalizeFabricSpecs } from './services/fabricSpecs.js';
import { normalizePrintFee } from './services/printFee.js';
import { registerPrintFeeOnCartItem } from './services/printFeeCart.js';
import { normalizeSaleFields } from './services/saleUnit.js';

function normalizeProductFields(data: Record<string, unknown>): void {
  normalizeSaleFields(data);
  normalizePrintFee(data);
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
}
