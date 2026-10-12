import { useAppState } from '@components/common/context/app.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@components/common/ui/Select.js';
import React from 'react';

const SHOP_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian rupee' },
  { code: 'USD', symbol: '$', name: 'US dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'AUD', symbol: 'A$', name: 'Australian dollar' },
  { code: 'GBP', symbol: '£', name: 'British pound' }
] as const;

/**
 * Header currency menu. Same five codes as the store rates. Choosing one
 * reloads the page so prices and the cart are rebuilt in that currency.
 */
export default function CurrencySwitcher(): React.ReactElement {
  const { shopCurrency = 'USD' } = useAppState();
  const current =
    SHOP_CURRENCIES.find((currency) => currency.code === shopCurrency) ??
    SHOP_CURRENCIES[1];

  return (
    <div className="shop-currency shrink-0">
      <Select
        value={current.code}
        onValueChange={(value) => {
          if (typeof value !== 'string' || value === current.code) {
            return;
          }
          const url = new URL(window.location.href);
          url.searchParams.set('currency', value);
          window.location.assign(url.toString());
        }}
      >
        <SelectTrigger
          aria-label="Currency"
          className="h-9 gap-1.5 border-white/30 bg-white/10 px-2.5 text-xs font-medium tracking-wide text-header-foreground shadow-none hover:bg-white/15 focus-visible:border-white/50 focus-visible:ring-1 focus-visible:ring-white/40 data-[size=default]:h-9 [&_svg]:text-header-foreground!"
        >
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span aria-hidden="true">{current.symbol}</span>
            <span>{current.code}</span>
          </span>
        </SelectTrigger>
        <SelectContent align="end" className="w-auto min-w-56">
          {SHOP_CURRENCIES.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <span className="w-6 shrink-0 text-center">{currency.symbol}</span>
              <span className="w-9 shrink-0 font-medium">{currency.code}</span>
              <span className="text-muted-foreground">{currency.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export const layout = {
  areaId: 'headerMiddleRight',
  sortOrder: 15
};
