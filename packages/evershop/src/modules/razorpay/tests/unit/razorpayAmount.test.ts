import {
  fromRazorpayMinorUnit,
  razorpayPaymentMatchesOrder,
  toRazorpayMinorUnit
} from '../../services/razorpayAmount.js';

describe('razorpay amounts', () => {
  test('converts rupees to paise', () => {
    expect(toRazorpayMinorUnit(250, 'INR')).toBe(25000);
    expect(toRazorpayMinorUnit('10.50', 'inr')).toBe(1050);
  });

  test('rejects a non-INR currency before a charge is created', () => {
    expect(() => toRazorpayMinorUnit(10, 'USD')).toThrow(
      'Razorpay accepts payments in INR only.'
    );
  });

  test('accepts a payment only when the paise match the order', () => {
    const order = { grand_total: '250.00', currency: 'INR' };
    expect(
      razorpayPaymentMatchesOrder(order, { amount: 25000, currency: 'INR' })
    ).toBe(true);
    expect(
      razorpayPaymentMatchesOrder(order, { amount: 100, currency: 'INR' })
    ).toBe(false);
    expect(
      razorpayPaymentMatchesOrder(
        { grand_total: '10.00', currency: 'USD' },
        { amount: 1000, currency: 'INR' }
      )
    ).toBe(false);
  });

  test('converts captured paise back to rupees', () => {
    expect(fromRazorpayMinorUnit(25000, 'INR')).toBe(250);
  });
});
