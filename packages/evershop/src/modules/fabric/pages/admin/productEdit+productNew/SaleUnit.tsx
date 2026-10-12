import { NumberField } from '@components/common/form/NumberField.js';
import { SelectField } from '@components/common/form/SelectField.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';
import { DEFAULT_PRINT_FEE } from '../../../services/printFee.js';
import { SALE_UNITS } from '../../../services/saleUnit.js';

interface SaleUnitProps {
  product?: {
    saleUnit?: string | null;
    moq?: number | null;
    printFee?: number | null;
    priceTestSwatch?: number | null;
    priceBigSwatch?: number | null;
    exportMargin?: number | null;
  } | null;
}

/**
 * Price unit and minimum order. Blank leaves an accessory unchanged.
 * A fabric uses these on the storefront and on the order line.
 */
export default function SaleUnit({ product }: SaleUnitProps) {
  return (
    <Card className="bg-popover">
      <CardHeader>
        <CardTitle>{_('Selling unit')}</CardTitle>
        <CardDescription>
          {_(
            'The product price is the India price, in rupees. Meter, kilogram, and the store weight units. Minimum order starts at 1 in that unit.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            name="sale_unit"
            label={_('Unit')}
            defaultValue={product?.saleUnit || 'none'}
            options={[
              { value: 'none', label: _('None') },
              ...SALE_UNITS.map((unit) => ({
                value: unit.value,
                label: _(unit.label)
              }))
            ]}
          />
          <NumberField
            name="moq"
            label={_('Minimum order')}
            placeholder="1"
            defaultValue={product?.moq ?? undefined}
            min={1}
          />
          <NumberField
            name="print_fee"
            label={_('Printing fee')}
            placeholder={String(DEFAULT_PRINT_FEE)}
            defaultValue={product ? product.printFee ?? undefined : DEFAULT_PRINT_FEE}
            min={0}
            step={0.01}
            helperText={_(
              'Added to each unit when a shopper prints a design on this fabric.'
            )}
            wrapperClassName="col-span-2"
          />
          <NumberField
            name="price_test_swatch"
            label={_('Test swatch price')}
            placeholder="40% of the product price"
            defaultValue={product?.priceTestSwatch ?? undefined}
            min={0}
            step={0.01}
            helperText={_('20×20 cm. Blank uses 40% of the product price.')}
          />
          <NumberField
            name="price_big_swatch"
            label={_('Big swatch price')}
            placeholder="80% of the product price"
            defaultValue={product?.priceBigSwatch ?? undefined}
            min={0}
            step={0.01}
            helperText={_('75×100 cm. Blank uses 80% of the product price. Linear meter uses the product price, and its ruler is 100×140 cm.')}
          />
          <NumberField
            name="export_margin"
            label={_('Export margin %')}
            placeholder={_('Store default')}
            defaultValue={product?.exportMargin ?? undefined}
            min={0}
            step={0.01}
            helperText={_(
              'Added only when this fabric is paid in USD, EUR, AUD, or GBP. Blank uses the store default. India pays the product price.'
            )}
            wrapperClassName="col-span-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export const layout = {
  areaId: 'leftSide',
  sortOrder: 12
};

export const query = `
  query Query {
    product(id: getContextValue("productId", null)) {
      saleUnit
      moq
      printFee
      priceTestSwatch
      priceBigSwatch
      exportMargin
    }
  }
`;
