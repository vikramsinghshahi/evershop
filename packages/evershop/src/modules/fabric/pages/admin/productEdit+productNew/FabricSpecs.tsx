import { InputField } from '@components/common/form/InputField.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';
import { FABRIC_SPECS } from '../../../services/fabricSpecs.js';

interface FabricSpecsProps {
  product?: Record<string, string | null | undefined> | null;
}

/**
 * Color, count, construction, width and GSM. Whatever is filled in
 * appears on that product's fabric card. A blank line stays hidden.
 */
export default function FabricSpecs({ product }: FabricSpecsProps) {
  return (
    <Card className="bg-popover">
      <CardHeader>
        <CardTitle>{_('Fabric details')}</CardTitle>
        <CardDescription>
          {_('Shown on the fabric card. Leave a line blank to hide it.')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2">
          {FABRIC_SPECS.map((spec) => (
            <InputField
              key={spec.column}
              name={spec.column}
              label={_(spec.label)}
              defaultValue={product?.[spec.field] ?? ''}
              maxLength={80}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export const layout = {
  areaId: 'leftSide',
  sortOrder: 13
};

export const query = `
  query Query {
    product(id: getContextValue("productId", null)) {
      fabricColor
      fabricCount
      fabricConstruction
      fabricWidth
      fabricGsm
    }
  }
`;
