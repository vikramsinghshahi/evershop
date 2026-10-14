import { SHIP_COUNTRIES, SHIP_RATES } from '../../services/shipCardSeed.js';
import {
  billableSlabKg,
  quoteShipInr,
  weightToKilograms,
  type ShipRateRow
} from '../../services/shipQuote.js';
import { normalizeCountries, normalizeRates, ShipCardError } from '../../services/shipSave.js';
import {
  applyShipSurcharge,
  DEFAULT_SHIP_SURCHARGE,
  normalizeShipSurcharge,
  readShipSurcharge,
  ShipSurchargeError
} from '../../services/shipSurcharge.js';

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
    expect(billableSlabKg(1)).toBe(1);
    expect(billableSlabKg(1.01)).toBe(1.5);
    expect(billableSlabKg(1.5)).toBe(1.5);
    expect(billableSlabKg(20)).toBe(20);
    expect(billableSlabKg(25)).toBe(20);
    expect(quoteShipInr(1.2, 1, card)?.amountInr).toBe(780);
    expect(quoteShipInr(1, 1, card)?.billedWeightKg).toBe(1);
  });

  test('bills anything up to 1 kg as 1 kg, never the 0.5 kg row', () => {
    expect(billableSlabKg(0)).toBe(1);
    expect(billableSlabKg(0.001)).toBe(1);
    expect(billableSlabKg(0.3)).toBe(1);
    expect(billableSlabKg(0.5)).toBe(1);
    expect(billableSlabKg(0.999)).toBe(1);
    expect(quoteShipInr(0, 1, card)).toMatchObject({ amountInr: 678, billedWeightKg: 1 });
    expect(quoteShipInr(0.2, 1, card)).toMatchObject({ amountInr: 678, billedWeightKg: 1 });
    expect(quoteShipInr(0.5, 1, card)).toMatchObject({ amountInr: 678, billedWeightKg: 1 });
    expect(quoteShipInr(0.5, 1, card.filter((row) => row.weightKg !== 1))?.amountInr).toBe(780);
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
    const usOneKg = SHIP_RATES.find(
      (rate) => rate.band === 'slab' && rate.zone === 12 && rate.weightKg === 1
    )?.amountInr;
    expect(usOneKg).toBeGreaterThan(1270);
    expect(quoteShipInr(0.4, 12, SHIP_RATES)?.amountInr).toBe(usOneKg);
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

describe('export shipping surcharge', () => {
  test('adds the percent on top of the card price', () => {
    expect(applyShipSurcharge(1134, 80)).toBe(2041.2);
    expect(applyShipSurcharge(1134, 0)).toBe(1134);
    expect(applyShipSurcharge(678, 12.5)).toBe(762.75);
    expect(applyShipSurcharge(0, 80)).toBe(0);
    expect(applyShipSurcharge(Number.NaN, 80)).toBe(0);
    expect(applyShipSurcharge(1000, Number.NaN)).toBe(1000);
  });

  test('a stored value that cannot be read charges the default', () => {
    expect(readShipSurcharge('80')).toBe(80);
    expect(readShipSurcharge('0')).toBe(0);
    expect(readShipSurcharge(45.5)).toBe(45.5);
    expect(readShipSurcharge('80%')).toBe(80);
    expect(readShipSurcharge('')).toBe(DEFAULT_SHIP_SURCHARGE);
    expect(readShipSurcharge(null)).toBe(DEFAULT_SHIP_SURCHARGE);
    expect(readShipSurcharge('abc')).toBe(DEFAULT_SHIP_SURCHARGE);
    expect(readShipSurcharge('-5')).toBe(DEFAULT_SHIP_SURCHARGE);
  });

  test('an admin entry that cannot be read is rejected', () => {
    expect(normalizeShipSurcharge('80')).toBe(80);
    expect(normalizeShipSurcharge(0)).toBe(0);
    expect(normalizeShipSurcharge(' 37.456 ')).toBe(37.46);
    expect(() => normalizeShipSurcharge('')).toThrow(ShipSurchargeError);
    expect(() => normalizeShipSurcharge('abc')).toThrow(ShipSurchargeError);
    expect(() => normalizeShipSurcharge(-1)).toThrow(ShipSurchargeError);
    expect(() => normalizeShipSurcharge(1001)).toThrow(ShipSurchargeError);
  });
});
