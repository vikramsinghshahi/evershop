import { Image } from '@components/common/Image.js';
import { ProductNoThumbnail } from '@components/common/ProductNoThumbnail.js';
import { ProductData } from '@components/frontStore/catalog/ProductContext.js';
import { ProductListAddToCart } from '@components/frontStore/catalog/ProductListAddToCart.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import {
  FABRIC_SWATCHES,
  isFabricSku
} from '../../../modules/fabric/services/printScale.js';
import { saleUnitLabel } from '../../../modules/fabric/services/saleUnit.js';
import React, { CSSProperties, ReactNode } from 'react';

function isFabricListingCard(product: ProductData): boolean {
  if (isFabricSku(product.sku)) {
    return true;
  }
  // A cloth added in the Fabrics category, even without a FABRIC- sku.
  return (product.url ?? '').includes('/fabrics/');
}

function ProductCardImage({
  product,
  imageWidth,
  imageHeight,
  className,
  loading,
  objectFit,
  style
}: {
  product: ProductData;
  imageWidth?: number;
  imageHeight?: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  objectFit?: 'contain' | 'cover';
  style?: CSSProperties;
}) {
  if (product.image) {
    return (
      <Image
        src={product.image.url}
        alt={product.image.alt || product.name}
        width={imageWidth || 120}
        height={imageHeight || 120}
        loading={loading}
        sizes="(max-width: 768px) 100vw, 33vw"
        className={className}
        objectFit={objectFit}
        style={style}
      />
    );
  }
  if (isFabricSku(product.sku)) {
    const width = imageWidth || 100;
    const height = imageHeight || 100;
    return (
      <div
        className={`w-full ${className ?? ''}`.trim()}
        style={{
          backgroundColor: FABRIC_SWATCHES[product.sku] || '#e7e0d6',
          aspectRatio: `${width} / ${height}`,
          ...style
        }}
        aria-hidden
      />
    );
  }
  return <ProductNoThumbnail width={imageWidth} height={imageHeight} />;
}

export const ProductListItemRender = ({
  product,
  imageWidth,
  imageHeight,
  layout = 'grid',
  showAddToCart = false,
  customAddToCartRenderer
}: {
  product: ProductData;
  imageWidth?: number;
  imageHeight?: number;
  layout?: 'grid' | 'list';
  showAddToCart?: boolean;
  customAddToCartRenderer?: (product: ProductData) => ReactNode;
}) => {
  if (layout === 'list') {
    return (
      <div className="product__list__item__inner group relative overflow-hidden flex gap-4 p-4">
        <div className="product__list__image flex-shrink-0">
          <a href={product.url}>
            <ProductCardImage
              product={product}
              imageWidth={imageWidth}
              imageHeight={imageHeight}
              loading="lazy"
              className="transition-transform duration-300 ease-in-out group-hover:scale-105 rounded-lg"
            />
          </a>
        </div>

        <div className="product__list__info flex-1 flex flex-col justify-between">
          <div>
            <h3 className="product__list__name h5 mb-2">
              <a
                href={product.url}
                className="hover:text-primary transition-colors"
              >
                {product.name}
              </a>
            </h3>

            <div className="product__list__sku text-sm text-muted-foreground mb-2">
              {_('SKU ${sku}', { sku: product.sku })}
            </div>

            <div className="product__list__price mb-2">
              {product.price.special &&
              product.price.regular < product.price.special ? (
                <div className="flex items-center gap-2">
                  <span
                    className="regular-price text-sm"
                    style={{ textDecoration: 'line-through', color: '#777' }}
                  >
                    {product.price.regular.text}
                  </span>
                  <span
                    className="special-price text-lg font-bold"
                    style={{ color: '#e53e3e' }}
                  >
                    {product.price.special.text}
                  </span>
                </div>
              ) : (
                <span className="regular-price text-lg font-bold">
                  {product.price.regular.text}
                </span>
              )}
            </div>

            <div className="product__list__stock mb-3">
              {product.inventory.isInStock ? (
                <span className="text-green-600 text-sm font-medium">
                  {_('In Stock')}
                </span>
              ) : (
                <span className="text-red-600 text-sm font-medium">
                  {_('Out of Stock')}
                </span>
              )}
            </div>
          </div>

          {showAddToCart && (
            <div className="product__list__actions invisible transform translate-y-2 transition-all duration-300 ease-in-out group-hover:visible group-hover:translate-y-0 group-focus-within:visible group-focus-within:translate-y-0 [@media(hover:none)]:visible [@media(hover:none)]:translate-y-0">
              {customAddToCartRenderer ? (
                customAddToCartRenderer(product)
              ) : (
                <ProductListAddToCart product={product} />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Cloth cards: label, name, photo, then the same price and action the
  // listing already shows. Accessory cards keep the layout below.
  if (isFabricListingCard(product)) {
    const imageBox: CSSProperties = {
      aspectRatio: '1 / 1',
      width: '100%',
      height: 'auto',
      objectFit: 'contain'
    };
    return (
      <div className="product__list__item__inner product__fabric__card group flex h-full flex-col rounded-[10px] border border-border bg-background p-4 shadow-sm">
        <a href={product.url} className="product__list__link flex flex-1 flex-col">
          <p className="text-xs text-muted-foreground">{_('Fabric')}</p>
          <h3 className="product__list__name mt-1 line-clamp-2 min-h-10 text-sm font-medium leading-5">
            {product.name}
          </h3>
          <div className="product__list__image my-4 flex w-full items-center justify-center overflow-hidden">
            <ProductCardImage
              product={product}
              imageWidth={imageWidth}
              imageHeight={imageWidth || imageHeight}
              loading="lazy"
              objectFit="contain"
              className="w-full transition-transform duration-500 ease-in-out hover:scale-105"
              style={imageBox}
            />
          </div>
          <div className="product__list__price mt-auto text-sm">
            {product.price.special &&
            product.price.regular < product.price.special ? (
              <>
                <span className="regular-price">{product.price.regular.text}</span>
                <span className="special-price">{product.price.special.text}</span>
              </>
            ) : (
              <span className="regular-price">{product.price.regular.text}</span>
            )}
            {product.saleUnit && (
              <span className="text-muted-foreground">
                {' '}
                / {saleUnitLabel(product.saleUnit)}
              </span>
            )}
            {product.saleUnit && (
              <div className="mt-1 text-xs text-muted-foreground">
                {_('MOQ')}: {product.moq ?? 1} {saleUnitLabel(product.saleUnit)}
              </div>
            )}
          </div>
        </a>
        {showAddToCart && (
          <div className="product__list__actions mt-3">
            {customAddToCartRenderer ? (
              customAddToCartRenderer(product)
            ) : (
              <ProductListAddToCart product={product} className="w-full" />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="product__list__item__inner group overflow-hidden">
      <a href={product.url} className="product__list__link block">
        <div className="product__list__image overflow-hidden flex w-full justify-center">
          <ProductCardImage
            product={product}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            className="transition-transform duration-500 ease-in-out group-hover:scale-110"
          />
        </div>
        <div className="product__list__info mt-3">
          <h3 className="product__list__name h5 font-medium">{product.name}</h3>
          <div className="product__list__price">
            {product.price.special &&
            product.price.regular < product.price.special ? (
              <>
                <span className="regular-price">
                  {product.price.regular.text}
                </span>
                <span className="special-price">
                  {product.price.special.text}
                </span>
              </>
            ) : (
              <span className="regular-price">
                {product.price.regular.text}
              </span>
            )}
          </div>
        </div>
      </a>
      {showAddToCart && (
        <div className="product__list__actions p-4 invisible transform translate-y-4 transition-all duration-300 ease-in-out group-hover:visible group-hover:translate-y-0 group-focus-within:visible group-focus-within:translate-y-0 [@media(hover:none)]:visible [@media(hover:none)]:translate-y-0">
          {customAddToCartRenderer ? (
            customAddToCartRenderer(product)
          ) : (
            <ProductListAddToCart product={product} className="w-full" />
          )}
        </div>
      )}
    </div>
  );
};
