import { ProductListingInfo } from '@components/frontStore/catalog/ProductListingInfo.js';
import { ProductListingPagination } from '@components/frontStore/catalog/ProductListingPagination.js';
import { ProductListingProducts } from '@components/frontStore/catalog/ProductListingProducts.js';
import { ProductSorting } from '@components/frontStore/catalog/ProductSorting.js';
import {
  ProductListingData,
  ProductListingProvider,
  useProductListing
} from '@components/frontStore/catalog/ProductListingContext.js';
import {
  FabricSearch,
  fabricNameQuery
} from '../../../components/FabricSearch.js';
import React from 'react';

function FabricListingToolbar() {
  const { products } = useProductListing();
  return (
    <ProductSorting
      className="flex justify-start"
      count={products.total}
      leading={
        <FabricSearch query={fabricNameQuery(products.currentFilters)} />
      }
    />
  );
}

/**
 * Store homepage. Fabrics are the catalog. Search and sort in the toolbar
 * are the filters; the price sidebar is not shown here. A wide screen
 * shows five cloth cards in each row.
 */
export default function FabricCatalog({
  listing
}: {
  listing: ProductListingData;
}) {
  return (
    <ProductListingProvider listing={listing}>
      <ProductListingInfo />
      <div className="min-w-0">
        <FabricListingToolbar />
        <ProductListingProducts
          gridColumns={5}
          className="fabric-product-grid"
        />
        <ProductListingPagination />
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
    fabricColor
    fabricCount
    fabricConstruction
    fabricWidth
    fabricGsm
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
