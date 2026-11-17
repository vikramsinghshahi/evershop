import { Button } from '@components/common/ui/Button.js';
import { toast } from '@components/common/ui/Sonner.js';
import { useCartState } from '@components/frontStore/cart/CartContext.js';
import {
  useCheckout,
  useCheckoutDispatch
} from '@components/frontStore/checkout/CheckoutContext.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React, { useCallback, useEffect, useRef, useState } from 'react';

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayCheckout = {
  open: () => void;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayCheckout;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay is only available in the browser'));
  }
  if (window.Razorpay) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-razorpay-checkout="true"]'
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Could not load Razorpay')),
        { once: true }
      );
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Razorpay'));
    document.body.appendChild(script);
  });
}

interface RazorpayMethodProps {
  setting: {
    razorpayDisplayName: string;
    razorpayKeyId: string;
  };
  createRazorpayOrderApi: string;
  verifyRazorpayPaymentApi: string;
}

export default function RazorpayMethod({
  setting,
  createRazorpayOrderApi,
  verifyRazorpayPaymentApi
}: RazorpayMethodProps) {
  const { registerPaymentComponent } = useCheckoutDispatch();
  const {
    checkoutSuccessUrl,
    orderPlaced,
    orderId,
    checkoutData: { paymentMethod }
  } = useCheckout();
  const {
    data: { billingAddress, shippingAddress, customerFullName, customerEmail }
  } = useCartState();
  const [busy, setBusy] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const opening = useRef(false);
  const autoStarted = useRef(false);

  const startPayment = useCallback(async () => {
    if (opening.current || !orderId) {
      return;
    }
    opening.current = true;
    setBusy(true);
    setCanRetry(false);
    try {
      const created = await fetch(createRazorpayOrderApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
      });
      const createdBody = await created.json();
      if (!created.ok || createdBody.error) {
        throw new Error(
          createdBody.error?.message || _('Could not start the Razorpay payment')
        );
      }
      await loadRazorpayScript();
      if (!window.Razorpay) {
        throw new Error(_('Could not load Razorpay'));
      }
      const { keyId, razorpayOrderId, amount, currency } = createdBody.data;
      const checkout = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: setting.razorpayDisplayName || 'Razorpay',
        description: _('Order payment'),
        order_id: razorpayOrderId,
        prefill: {
          name:
            billingAddress?.recipient ||
            shippingAddress?.recipient ||
            customerFullName ||
            '',
          email: customerEmail || '',
          contact: billingAddress?.telephone || shippingAddress?.telephone || ''
        },
        theme: { color: '#0f3d73' },
        handler: async (response: RazorpaySuccess) => {
          try {
            const verified = await fetch(verifyRazorpayPaymentApi, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifiedBody = await verified.json();
            if (!verified.ok || verifiedBody.error) {
              throw new Error(
                verifiedBody.error?.message ||
                  _('Payment could not be verified')
              );
            }
            window.location.href = `${checkoutSuccessUrl}/${orderId}`;
          } catch (verifyError) {
            opening.current = false;
            setBusy(false);
            setCanRetry(true);
            toast.error(
              verifyError instanceof Error
                ? verifyError.message
                : _('Payment could not be verified')
            );
          }
        },
        modal: {
          ondismiss: () => {
            opening.current = false;
            setBusy(false);
            setCanRetry(true);
            toast.error(_('Payment was not completed.'));
          }
        }
      });
      checkout.open();
    } catch (startError) {
      opening.current = false;
      setBusy(false);
      setCanRetry(true);
      toast.error(
        startError instanceof Error
          ? startError.message
          : _('Could not start the Razorpay payment')
      );
    }
  }, [
    billingAddress,
    checkoutSuccessUrl,
    createRazorpayOrderApi,
    customerEmail,
    customerFullName,
    orderId,
    setting.razorpayDisplayName,
    shippingAddress,
    verifyRazorpayPaymentApi
  ]);

  const startPaymentRef = useRef(startPayment);
  startPaymentRef.current = startPayment;

  useEffect(() => {
    if (!orderPlaced || paymentMethod !== 'razorpay' || autoStarted.current) {
      return;
    }
    autoStarted.current = true;
    void startPaymentRef.current();
  }, [orderPlaced, paymentMethod]);

  useEffect(() => {
    registerPaymentComponent('razorpay', {
      nameRenderer: () => (
        <div className="flex items-center justify-between w-full">
          <span>{setting.razorpayDisplayName || _('Razorpay')}</span>
          <span className="text-sm font-semibold tracking-wide">Razorpay</span>
        </div>
      ),
      formRenderer: () => (
        <div className="py-3 text-sm text-muted-foreground">
          <div className="grid gap-2">
            <p>
              {_(
                'Cards, UPI, and netbanking open in a Razorpay window after you place the order. The charge uses the currency selected in the header.'
              )}
            </p>
            {setting.razorpayKeyId?.startsWith('rzp_test_') && (
              <div className="rounded border border-border p-3 text-xs">
                <div className="font-medium text-foreground">
                  {_('Test payment')}
                </div>
                <div>{_('Card: 4111 1111 1111 1111, any future expiry, any CVV.')}</div>
                <div>{_('UPI: success@razorpay')}</div>
              </div>
            )}
          </div>
        </div>
      ),
      checkoutButtonRenderer: () => {
        const { checkout } = useCheckoutDispatch();
        const { loadingStates, orderPlaced: placed } = useCheckout();
        const handleClick = async (event: React.MouseEvent) => {
          event.preventDefault();
          try {
            if (placed || canRetry) {
              await startPayment();
              return;
            }
            await checkout();
          } catch (checkoutError) {
            toast.error(
              checkoutError instanceof Error
                ? checkoutError.message
                : _('Failed to place order. Please try again.')
            );
          }
        };
        const isDisabled = loadingStates.placingOrder || busy;
        return (
          <Button
            variant="default"
            size="xl"
            type="button"
            onClick={handleClick}
            disabled={isDisabled}
            className="w-full"
          >
            {loadingStates.placingOrder || busy
              ? _('Opening Razorpay...')
              : canRetry
                ? _('Try Razorpay again')
                : _('Pay with Razorpay')}
          </Button>
        );
      }
    });
  }, [
    busy,
    canRetry,
    registerPaymentComponent,
    setting.razorpayDisplayName,
    setting.razorpayKeyId,
    startPayment
  ]);

  return null;
}

export const layout = {
  areaId: 'checkoutFormAfter',
  sortOrder: 12
};

export const query = `
  query Query {
    setting {
      razorpayDisplayName
      razorpayKeyId
    }
    createRazorpayOrderApi: url(routeId: "razorpayCreateOrder")
    verifyRazorpayPaymentApi: url(routeId: "razorpayVerifyPayment")
  }
`;
