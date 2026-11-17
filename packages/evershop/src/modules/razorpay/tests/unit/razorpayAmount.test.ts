import {
  fromRazorpayMinorUnit,
  razorpayPaymentMatchesOrder,
  toRazorpayMinorUnit
} from '../../services/razorpayAmount.js';

describe('razorpay amounts', () => {
  test('converts rupees to paise and dollars to cents', () => {
    expect(toRazorpayMinorUnit(250, 'INR')).toBe(25000);
    expect(toRazorpayMinorUnit('10.50', 'inr')).toBe(1050);
    expect(toRazorpayMinorUnit(10, 'USD')).toBe(1000);
    expect(toRazorpayMinorUnit('4.34', 'usd')).toBe(434);
  });

  test('accepts a payment only when the amount and currency match the order', () => {
    const rupees = { grand_total: '250.00', currency: 'INR' };
    expect(
      razorpayPaymentMatchesOrder(rupees, { amount: 25000, currency: 'INR' })
    ).toBe(true);
    expect(
      razorpayPaymentMatchesOrder(rupees, { amount: 100, currency: 'INR' })
    ).toBe(false);
    expect(
      razorpayPaymentMatchesOrder(
        { grand_total: '10.00', currency: 'USD' },
        { amount: 1000, currency: 'USD' }
      )
    ).toBe(true);
    expect(
      razorpayPaymentMatchesOrder(
        { grand_total: '10.00', currency: 'USD' },
        { amount: 1000, currency: 'INR' }
      )
    ).toBe(false);
  });

  test('converts captured minor units back to major units', () => {
    expect(fromRazorpayMinorUnit(25000, 'INR')).toBe(250);
    expect(fromRazorpayMinorUnit(434, 'USD')).toBe(4.34);
  });
});
