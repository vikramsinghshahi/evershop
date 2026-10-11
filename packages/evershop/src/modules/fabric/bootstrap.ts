import { hookBefore } from '../../lib/util/hookable.js';
import { normalizeFabricSpecs } from './services/fabricSpecs.js';
import { normalizeSaleFields } from './services/saleUnit.js';

function normalizeProductFields(data: Record<string, unknown>): void {
  normalizeSaleFields(data);
  normalizeFabricSpecs(data);
}

export default function bootstrap() {
  hookBefore('updateProduct', (_uuid, data) => {
    normalizeProductFields(data);
  });
  hookBefore('createProduct', (data) => {
    normalizeProductFields(data);
  });
}
