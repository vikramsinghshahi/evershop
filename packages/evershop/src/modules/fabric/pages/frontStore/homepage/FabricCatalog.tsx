import { ProductListingFilter } from '@components/frontStore/catalog/ProductListingFilter.js';
import { ProductListingInfo } from '@components/frontStore/catalog/ProductListingInfo.js';
import { ProductListingPagination } from '@components/frontStore/catalog/ProductListingPagination.js';
import { ProductListingProducts } from '@components/frontStore/catalog/ProductListingProducts.js';
import {
  ProductListingData,
  ProductListingProvider
} from '@components/frontStore/catalog/ProductListingContext.js';
import ProductListingSorting from '../../../../catalog/pages/frontStore/productListing/ProductListingSorting.js';
import React from 'react';

/**
 * Store homepage. Fabrics are the catalog: the same filter sidebar, sort,
 * cards and pagination as `/products`, limited to the Fabrics category.
 */
export default function FabricCatalog({
  listing
}: {
  listing: ProductListingData;
}) {
  return (
    <ProductListingProvider listing={listing}>
      <ProductListingInfo />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
        <ProductListingFilter />
        <div className="min-w-0">
          <ProductListingSorting />
          <ProductListingProducts />
          <ProductListingPagination />
        </div>
      </div>
    </ProductListingProvider>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    listing: productListing {
      products {
        items {
          ...Product
        }
        currentFilters {
          key
          operation
          value
        }
        total
      }
      availableAttributes {
        attributeCode
        attributeName
        options {
          optionId
          optionText
        }
      }
      priceRange {
        min
        max
        minText
        maxText
      }
      categories {
        categoryId
        uuid
        name
        depth
      }
    }
}`;

export const fragments = `
  fragment Product on Product {
    productId
    name
    sku
    saleUnit
    moq
    variantGroupId
    price {
      regular {
        value
        text
      }
      special {
        value
        text
      }
    }
    inventory {
      isInStock
    }
    image {
      alt
      url
    }
    url
  }
`;
