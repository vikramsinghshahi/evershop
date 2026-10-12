import { calculateTaxAmount } from '../../tax/services/calculateTaxAmount.js';
import { getPriceIncludingTax } from '../../tax/services/taxSettings.js';
import { toPrice } from '../../checkout/services/toPrice.js';
import { orderSizeFromOptions, sizePriceFromOptions } from './orderSize.js';
import { printFeeFromOptions } from './printFee.js';

/**
 * Unit price after a snapshotted printing fee. Lines without a fee, including
 * plain fabric and every other product, come back unchanged.
 *
 * The fee is entered in the same terms as the fabric price. When catalog
 * prices include tax, the fee does too.
 */
export function unitPriceWithPrintFee(
  unitPrice: number,
  rawOptions: string | null | undefined,
  side: 'excl' | 'incl',
  priceIncludesTax: boolean,
  taxPercent: number
): number {
  const base = sizePriceFromOptions(rawOptions) ?? unitPrice;
  const fee = printFeeFromOptions(rawOptions);
  if (!fee && base === unitPrice) {
    return toPrice(String(unitPrice));
  }
  const percent = Number.isFinite(taxPercent) ? taxPercent : 0;
  if (!fee) {
    return toPrice(String(base));
  }
  if (priceIncludesTax) {
    if (side === 'incl') {
      return toPrice(String(base + fee));
    }
    const tax = calculateTaxAmount(percent, fee, 1, true);
    return toPrice(String(base + fee - tax));
  }
  if (side === 'excl') {
    return toPrice(String(base + fee));
  }
  const tax = calculateTaxAmount(percent, fee, 1, false);
  return toPrice(String(base + fee + tax));
}

export function registerPrintFeeOnCartItem(fields: unknown[]): unknown[] {
  const list = Array.isArray(fields) ? fields : [];
  return list.concat([
    {
      key: 'final_price',
      resolvers: [
        async function resolver(price: number) {
          return unitPriceWithPrintFee(
            price,
            this.getData('product_custom_options'),
            'excl',
            getPriceIncludingTax(),
            Number(this.getData('tax_percent')) || 0
          );
        }
      ],
      dependencies: ['product_price', 'product_custom_options', 'tax_percent']
    },
    {
      key: 'final_price_incl_tax',
      resolvers: [
        async function resolver(price: number) {
          return unitPriceWithPrintFee(
            price,
            this.getData('product_custom_options'),
            'incl',
            getPriceIncludingTax(),
            Number(this.getData('tax_percent')) || 0
          );
        }
      ],
      dependencies: ['product_price_incl_tax', 'product_custom_options', 'tax_percent']
    },
    {
      key: 'qty',
      resolvers: [
        async function resolver(qty: number) {
          const size = orderSizeFromOptions(this.getData('product_custom_options'));
          if ((size === 'test' || size === 'big') && Number(qty) >= 1) {
            this.setError('qty');
          }
          return qty;
        }
      ],
      dependencies: ['product_custom_options']
    }
  ]);
}
