import Area from '@components/common/Area.js';
import { Form } from '@components/common/form/Form.js';
import { NumberField } from '@components/common/form/NumberField.js';
import { Button } from '@components/common/ui/Button.js';
import { toast } from '@components/common/ui/Sonner.js';
import {
  AddToCart,
  AddToCartActions,
  AddToCartState
} from '@components/frontStore/cart/AddToCart.js';
import { useProduct } from '@components/frontStore/catalog/ProductContext.js';
import {
  getFabricPurchaseMode,
  subscribeFabricPurchase
} from '../../../modules/fabric/services/fabricPurchaseView.js';
import { isFabricSku } from '../../../modules/fabric/services/printScale.js';
import { parseMoq, saleUnitLabel } from '../../../modules/fabric/services/saleUnit.js';
import { VariantSelector } from '@components/frontStore/catalog/VariantSelector.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';
import { useForm } from 'react-hook-form';

/**
 * The buy box. Only the pieces that need the form stay inline here (the
 * variant selector and the add-to-cart controls register `qty` and the
 * variant fields on this form). The price and the attribute list are page
 * blocks (`productView/ProductPrice`, `productView/ProductAttributes`) that
 * register into the `productSinglePageForm` Area below, so a theme can move
 * them from `layouts.json`.
 */
export function ProductSingleForm() {
  const {
    sku,
    saleUnit,
    moq,
    inventory: { isInStock }
  } = useProduct();
  const minimum = parseMoq(moq) ?? 1;
  const unit = saleUnitLabel(saleUnit);
  const form = useForm();
  const purchaseMode = React.useSyncExternalStore(
    subscribeFabricPurchase,
    getFabricPurchaseMode,
    () => 'plain' as const
  );
  const printing = isFabricSku(sku) && purchaseMode === 'print';
  const watchedScale = form.watch('printScale');
  const watchedDesign = form.watch('printDesign');
  const scale = printing
    ? Number.isInteger(watchedScale)
      ? (watchedScale as number)
      : 100
    : undefined;
  const design = printing && watchedDesign?.designId ? watchedDesign : undefined;
  const [addingToCart, setAddingToCart] = React.useState(false);
  return (
    <Form id="productForm" method="POST" submitBtn={false} form={form}>
      <Area
        id="productSinglePageForm"
        coreComponents={[
          {
            component: {
              default: <VariantSelector />
            },
            sortOrder: 10,
            id: 'variantSelector'
          },
          {
            component: {
              default: (
                <AddToCart
                  product={{
                    sku: sku,
                    isInStock: isInStock
                  }}
                  qty={form.watch('qty') || 1}
                  scale={scale}
                  design={design}
                  mode={isFabricSku(sku) && purchaseMode === 'plain' ? 'plain' : undefined}
                  onSuccess={() => {
                    // To show the mini cart after adding a product to cart
                  }}
                  onError={(errorMessage) => {
                    toast.error(
                      errorMessage || _('Failed to add product to cart')
                    );
                  }}
                >
                  {(state: AddToCartState, actions: AddToCartActions) => (
                    <div className="mt-6 space-y-3">
                      {state.isInStock === true && (
                        <>
                          <NumberField
                            name="qty"
                            label={unit ? `${_('Quantity')} (${unit})` : _('Quantity')}
                            className="w-24"
                            min={minimum}
                            required
                            placeholder={_('Quantity')}
                            defaultValue={minimum}
                            wrapperClassName="w-1/2"
                            helperText={
                              unit
                                ? `${_('MOQ')}: ${minimum} ${unit}`
                                : undefined
                            }
                          />
                          <Button
                            variant={'default'}
                            size={'lg'}
                            onClick={() => {
                              if (printing && !form.getValues('printDesign')?.designId) {
                                toast.error(
                                  'Upload a design or choose one before adding this fabric.'
                                );
                                return;
                              }
                              form
                                .trigger()
                                .then((isValid) => {
                                  if (isValid) {
                                    setAddingToCart(true);
                                    actions.addToCart();
                                  }
                                })
                                .finally(() => {
                                  setAddingToCart(false);
                                });
                            }}
                            className="mt-2 w-full"
                            isLoading={addingToCart || state.isLoading}
                          >
                            {_('Add to cart')}
                          </Button>
                        </>
                      )}
                      {state.isInStock === false && (
                        <Button
                          onClick={() => {}}
                          className="mt-2 w-full"
                          disabled
                        >
                          {_('Sold out')}
                        </Button>
                      )}
                    </div>
                  )}
                </AddToCart>
              )
            },
            sortOrder: 30,
            id: 'addToCartButton'
          }
        ]}
      />
    </Form>
  );
}
