import { SHIP_COUNTRIES, SHIP_RATES } from '../../services/shipCardSeed.js';
import {
  billableSlabKg,
  quoteShipInr,
  weightToKilograms,
  type ShipRateRow
} from '../../services/shipQuote.js';
import { normalizeCountries, normalizeRates, ShipCardError } from '../../services/shipSave.js';

const slab = (zone: number, weightKg: number, amountInr: number): ShipRateRow => ({
  band: 'slab',
  zone,
  weightKg,
  amountInr
});
const perKg = (zone: number, weightKg: number, amountInr: number): ShipRateRow => ({
  band: 'per_kg',
  zone,
  weightKg,
  amountInr
});

describe('export shipping quote', () => {
  const card: ShipRateRow[] = [
    slab(1, 0.5, 521),
    slab(1, 1, 678),
    slab(1, 1.5, 780),
    slab(1, 20, 6858),
    perKg(1, 21, 502),
    perKg(1, 45, 452),
    perKg(1, 71, 418)
  ];

  test('rounds up to the half-kilogram row and keeps an exact weight', () => {
    expect(billableSlabKg(0)).toBe(0.5);
    expect(billableSlabKg(0.3)).toBe(0.5);
    expect(billableSlabKg(1)).toBe(1);
    expect(billableSlabKg(1.01)).toBe(1.5);
    expect(billableSlabKg(20)).toBe(20);
    expect(quoteShipInr(1.2, 1, card)?.amountInr).toBe(780);
    expect(quoteShipInr(1, 1, card)?.billedWeightKg).toBe(1);
    expect(quoteShipInr(0, 1, card)?.amountInr).toBe(521);
  });

  test('adds whole kilograms after 20 kg at the band for that weight', () => {
    expect(quoteShipInr(20, 1, card)).toMatchObject({
      amountInr: 6858,
      extraKg: null
    });
    expect(quoteShipInr(20.1, 1, card)).toMatchObject({
      amountInr: 6858 + 502,
      extraKg: 1,
      perKgRateInr: 502
    });
    expect(quoteShipInr(22, 1, card)?.amountInr).toBe(6858 + 2 * 502);
    expect(quoteShipInr(45, 1, card)?.amountInr).toBe(6858 + 25 * 452);
    expect(quoteShipInr(71, 1, card)?.amountInr).toBe(6858 + 51 * 418);
  });

  test('does not invent a cheaper row when the card cell is missing', () => {
    expect(quoteShipInr(1.2, 1, card.filter((row) => row.weightKg !== 1.5))?.amountInr).toBe(
      6858
    );
    expect(quoteShipInr(22, 1, card.filter((row) => row.weightKg !== 20))).toBeNull();
    expect(quoteShipInr(50, 1, card.filter((row) => row.weightKg !== 45))).toBeNull();
    expect(quoteShipInr(-1, 1, card)).toBeNull();
    expect(quoteShipInr(1, 14, card)).toBeNull();
    expect(quoteShipInr(1, 1, card.filter((row) => row.amountInr >= 0 && row.weightKg !== 0.5 && row.band === 'per_kg'))).toBeNull();
  });

  test('converts store weight units into kilograms', () => {
    expect(weightToKilograms(1000, 'g')).toBe(1);
    expect(weightToKilograms(1, 'kg')).toBe(1);
    expect(weightToKilograms(1, 'lb')).toBeCloseTo(0.45359237, 6);
    expect(weightToKilograms(-2, 'kg')).toBe(0);
  });

  test('the courier sheets price the UAE, the UK and the US', () => {
    expect(SHIP_COUNTRIES.find((country) => country.countryCode === 'AE')?.zone).toBe(1);
    expect(SHIP_COUNTRIES.find((country) => country.countryCode === 'GB')?.zone).toBe(7);
    expect(SHIP_COUNTRIES.find((country) => country.countryCode === 'US')?.zone).toBe(12);
    expect(SHIP_COUNTRIES.some((country) => country.countryCode === 'IN')).toBe(false);
    expect(quoteShipInr(1.2, 1, SHIP_RATES)?.amountInr).toBe(780);
    expect(quoteShipInr(0.4, 12, SHIP_RATES)?.amountInr).toBe(1270);
    expect(quoteShipInr(22, 1, SHIP_RATES)?.amountInr).toBe(6858 + 2 * 502);
    expect(SHIP_RATES.some((rate) => rate.band === 'slab' && rate.weightKg === 0)).toBe(false);
  });

  test('rejects a country or a rate that cannot be priced', () => {
    expect(normalizeCountries([{ countryCode: 'ae', zone: 1 }])).toEqual([
      { countryCode: 'AE', zone: 1 }
    ]);
    expect(() => normalizeCountries([{ countryCode: 'ZZ', zone: 1 }])).toThrow(ShipCardError);
    expect(() => normalizeCountries([])).toThrow(ShipCardError);
    expect(
      normalizeRates([{ band: 'slab', weightKg: 0.5, zone: 1, amountInr: '1,270' }])
    ).toEqual([{ band: 'slab', weightKg: 0.5, zone: 1, amountInr: 1270 }]);
    expect(() =>
      normalizeRates([{ band: 'slab', weightKg: 0.5, zone: 1, amountInr: -1 }])
    ).toThrow(ShipCardError);
  });
});
