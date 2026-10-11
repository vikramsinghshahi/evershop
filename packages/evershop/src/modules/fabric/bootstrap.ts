import { hookBefore } from '../../lib/util/hookable.js';
import { normalizeSaleFields } from './services/saleUnit.js';

export default function bootstrap() {
  hookBefore('updateProduct', (_uuid, data) => {
    normalizeSaleFields(data);
  });
  hookBefore('createProduct', (data) => {
    normalizeSaleFields(data);
  });
}
