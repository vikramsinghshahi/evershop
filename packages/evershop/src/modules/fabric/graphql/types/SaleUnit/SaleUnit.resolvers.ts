import { buildUrl } from '../../../../../lib/router/buildUrl.js';
import { readPrintFee } from '../../../services/printFee.js';
import { isSaleUnit, parseMoq } from '../../../services/saleUnit.js';

function readUnit(row: { saleUnit?: unknown; sale_unit?: unknown }): string | null {
  const value = row?.saleUnit ?? row?.sale_unit;
  return isSaleUnit(value) ? value : null;
}

function readMoq(row: { moq?: unknown }): number | null {
  return parseMoq(row?.moq);
}

export default {
  Product: {
    saleUnit: (product) => readUnit(product ?? {}),
    moq: (product) => readMoq(product ?? {}),
    printFee: (product) => readPrintFee(product?.printFee ?? product?.print_fee),
    priceTestSwatch: (product) =>
      readPrintFee(product?.priceTestSwatch ?? product?.price_test_swatch),
    priceBigSwatch: (product) =>
      readPrintFee(product?.priceBigSwatch ?? product?.price_big_swatch)
  },
  OrderItem: {
    saleUnit: (item) => readUnit(item ?? {}),
    moq: (item) => readMoq(item ?? {}),
    updateSaleApi: (item) =>
      buildUrl('updateOrderItemSale', { uuid: item.uuid })
  }
};
