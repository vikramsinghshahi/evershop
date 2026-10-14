import Area from '@components/common/Area.js';
import { useAppState } from '@components/common/context/app.js';
import { LoadingBar } from '@components/common/LoadingBar.js';
import {
  CartProvider,
  CartData
} from '@components/frontStore/cart/CartContext.js';
import {
  CustomerProvider,
  Customer
} from '@components/frontStore/customer/CustomerContext.js';
import { Footer } from '@components/frontStore/Footer.js';
import { Header } from '@components/frontStore/Header.js';
import React from 'react';

interface BaseProps {
  myCart: CartData;
  customer: Customer;
  themeConfig: {
    copyRight: string;
  };
  addMineCartItemApi: string;
  loginApi: string;
  logoutApi: string;
  registerApi: string;
}
export default function Base({
  myCart,
  customer,
  themeConfig,
  addMineCartItemApi,
  loginApi,
  logoutApi,
  registerApi
}: BaseProps) {
  const { config } = useAppState();
  const routeId = config?.pageMeta?.route?.id;
  const isLandingPage = routeId === 'landingPageView';
  // Every product listing (home, all products, a category such as Accessories,
  // search). On a wide desktop these drop the 1200px column so the filter and
  // the grid use the side margins. The header does this on every page.
  const wideListing =
    routeId === 'homepage' ||
    routeId === 'productListing' ||
    routeId === 'categoryView' ||
    routeId === 'catalogSearch';
  const shell = (
    <>
      <LoadingBar />
      <Header />
      <Area
        id={isLandingPage ? 'landing_page_content' : 'content'}
        className="page-width min-h-36"
        wrapper="main"
        editableInPageBuilder
      />
      <Footer copyRight={themeConfig.copyRight} />
    </>
  );
  return (
    <CustomerProvider
      initialCustomer={customer}
      loginAPI={loginApi}
      logoutAPI={logoutApi}
      registerAPI={registerApi}
    >
      <CartProvider
        cart={myCart}
        query={`${query}\n${fragments}`}
        addMineCartItemApi={addMineCartItemApi}
      >
        {wideListing ? <div className="listing-screen">{shell}</div> : shell}
      </CartProvider>
    </CustomerProvider>
  );
}

export const layout = {
  areaId: 'body',
  sortOrder: 1
};

export const query = `
  query Query {
    myCart {
      ...ShoppingCart
      addItemApi
      addPaymentMethodApi
      addShippingMethodApi
      addContactInfoApi
      addAddressApi
      addNoteApi
      checkoutApi
      applyCouponApi
      removeCouponApi
      availableShippingMethods {
        providerCode
        code
        name
        cost {
          value
          text
        }
      }
      availablePaymentMethods {
        code
        name
      }
      items {
        ...ShoppingCartItem
        cartItemId
        removeApi
        updateQtyApi
        errors
      }
    }
    customer: currentCustomer {
      customerId
      uuid
      email
      fullName
      groupId
      createdAt {
        value
        text
      }
      addAddressApi
      updateProfileApi
      addresses {
        customerAddressId
        uuid
        recipient
        givenName
        familyName
        organization
        addressLine1
        addressLine2
        addressLine3
        dependentLocality {
          key
          name
        }
        locality {
          key
          name
        }
        administrativeArea {
          key
          name
          isoCode
        }
        postalCode
        sortingCode
        country {
          code
          name
        }
        telephone
        extra
        formatted
        isDefault
        updateApi
        deleteApi
      }
      orders {
        ...ShoppingCart
        orderId
        status {
          name
          code
          badge
        }
        orderNumber
        shipmentStatus {
          name
          code
          badge
        }
        paymentStatus {
          name
          code
          badge
        }
        items {
          ...ShoppingCartItem
          orderItemId
        }
      }
    }
    themeConfig {
      copyRight
    }
    addMineCartItemApi: url(routeId: "addMineCartItem")
    loginApi: url(routeId: "customerLoginJson")
    registerApi: url(routeId: "createCustomer")
    logoutApi: url(routeId: "customerLogoutJson")
  }
`;

export const fragments = `
  fragment ShoppingCart on ShoppingCart {
    uuid
    currency
    customerId
    customerGroupId
    customerEmail
    customerFullName
    coupon
    noShippingRequired
    shippingMethod
    shippingMethodName
    paymentMethod
    paymentMethodName
    shippingNote
    taxAmount {
      value
      text
    }
    totalTaxAmount {
      value
      text
    }
    discountAmount {
      value
      text
    }
    shippingFeeExclTax {
      value
      text
    }
    shippingFeeInclTax {
      value
      text
    }
    shippingTaxAmount {
      value
      text
    }
    subTotal {
      value
      text
    }
    subTotalInclTax {
      value
      text
    }
    subTotalWithDiscount {
      value
      text
    }
    subTotalWithDiscountInclTax {
      value
      text
    }
    totalQty
    totalWeight {
      value
      unit
    }
    taxAmountBeforeDiscount {
      value
      text
    }
    grandTotal {
      value
      text
    }
    billingAddress {
      recipient
      givenName
      familyName
      organization
      addressLine1
      addressLine2
      addressLine3
      dependentLocality {
        key
        name
      }
      locality {
        key
        name
      }
      administrativeArea {
        key
        name
        isoCode
      }
      postalCode
      sortingCode
      country {
        code
        name
      }
      telephone
      extra
      formatted
    }
    shippingAddress {
      recipient
      givenName
      familyName
      organization
      addressLine1
      addressLine2
      addressLine3
      dependentLocality {
        key
        name
      }
      locality {
        key
        name
      }
      administrativeArea {
        key
        name
        isoCode
      }
      postalCode
      sortingCode
      country {
        code
        name
      }
      telephone
      extra
      formatted
    }
    createdAt {
      value
      text
    }
    updatedAt  {
      value
      text
    }
  }

  fragment ShoppingCartItem on ShoppingCartItem {
    uuid
    productId
    productSku
    productName
    thumbnail
    productWeight {
      value
      unit
    }
    productPrice {
      value
      text
    }
    productPriceInclTax {
      value
      text
    }
    qty
    finalPrice {
      value
      text
    }
    finalPriceInclTax {
      value
      text
    }
    taxPercent
    taxAmount {
      value
      text
    }
    taxAmountBeforeDiscount {
      value
      text
    }
    discountAmount {
      value
      text
    }
    lineTotal {
      value
      text
    }
    subTotal {
      value
      text
    }
    lineTotalWithDiscount {
      value
      text
    }
    lineTotalWithDiscountInclTax {
      value
      text
    }
    lineTotalInclTax {
      value
      text
    }
    total {
      value
      text
    }
    variantGroupId
    variantOptions {
      attributeCode
      attributeName
      attributeId
      optionId
      optionText
    }
    productCustomOptions
    productUrl
  }
`;
