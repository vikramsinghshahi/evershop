import { FABRIC_SPECS, readFabricSpec } from '../../../services/fabricSpecs.js';

const productFields = Object.fromEntries(
  FABRIC_SPECS.map((spec) => [
    spec.field,
    (product: Record<string, unknown>) => readFabricSpec(product, spec.field)
  ])
);

export default {
  Product: productFields
};
