import React from 'react';

export interface DesignerTerms {
  rate: number;
  bonusTiers: { threshold: number; percent: number }[];
  holdDays: number;
  minPayout: number;
}

export function inr(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
}

/** Plain-language terms the designer accepts. Numbers come from the store settings. */
export function SellerAgreement({ terms, version }: { terms: DesignerTerms; version: string }) {
  return (
    <div className="seller-agreement space-y-2 text-sm text-neutral-700">
      <p className="text-xs text-neutral-500">Seller Agreement, version {version}</p>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>
          You confirm every design you upload is your own work or that you hold a licence to sell
          it for printing. You are responsible for any copyright or trademark claim about it.
        </li>
        <li>
          We print your design on fabric only for orders placed on this shop, and we set the retail
          price. We may adjust colour, repeat and scale to suit the fabric a shopper orders.
        </li>
        <li>
          You earn {terms.rate}% of the line value (after discount, before tax and shipping) on
          every printed order that uses your design, converted to rupees at the order&apos;s exchange
          rate.
        </li>
        {terms.bonusTiers.length > 0 && (
          <li>
            Monthly bonus on that month&apos;s sales:{' '}
            {terms.bonusTiers
              .map((tier) => `+${tier.percent}% when your commission reaches ${inr(tier.threshold)}`)
              .join('; ')}
            .
          </li>
        )}
        <li>
          Commission becomes payable {terms.holdDays} days after the order is delivered and
          completed. Canceled, returned or refunded orders earn nothing; if they were already paid,
          the amount comes off your next payout.
        </li>
        <li>
          Payouts are sent to your PayPal or Indian bank account once your payable balance is at
          least {inr(terms.minPayout)}.
        </li>
        <li>Orders you place for your own designs do not earn commission.</li>
        <li>
          You can withdraw a design at any time. Orders already placed with it are still printed
          and still earn commission.
        </li>
      </ul>
    </div>
  );
}
