import {
  LOCAL_SHIP_SEED,
  quoteLocalShip,
  type LocalRateRow
} from '../../services/localShipQuote.js';
import { LocalShipError, normalizeLocalRates } from '../../services/localShipSave.js';

const row = (
  service: LocalRateRow['service'],
  band: LocalRateRow['band'],
  weightKg: number,
  amountInr: number
): LocalRateRow => ({ service, band, weightKg, amountInr });

describe('India shipping quote', () => {
  test('seeds the high end of each DTDC band', () => {
    const amount = (
      service: LocalRateRow['service'],
      band: LocalRateRow['band'],
      weightKg: number
    ) =>
      LOCAL_SHIP_SEED.find(
        (rate) => rate.service === service && rate.band === band && rate.weightKg === weightKg
      )?.amountInr;
    expect(LOCAL_SHIP_SEED).toHaveLength(18);
    expect(amount('lite', 'slab', 0.5)).toBe(100);
    expect(amount('lite', 'slab', 1)).toBe(200);
    expect(amount('lite', 'slab', 2)).toBe(300);
    expect(amount('lite', 'slab', 3)).toBe(400);
    expect(amount('lite', 'slab', 5)).toBe(500);
    expect(amount('lite', 'per_kg', 5)).toBe(100);
    expect(amount('plus', 'slab', 0.5)).toBe(150);
    expect(amount('plus', 'slab', 5)).toBe(550);
    expect(amount('plus', 'per_kg', 5)).toBe(100);
    expect(amount('prime', 'slab', 0.5)).toBe(250);
    expect(amount('prime', 'slab', 1)).toBe(350);
    expect(amount('prime', 'slab', 2)).toBe(450);
    expect(amount('prime', 'slab', 3)).toBe(550);
    expect(amount('prime', 'slab', 5)).toBe(650);
    expect(amount('prime', 'per_kg', 5)).toBe(150);
  });

  test('charges the slab that covers the weight, including the 500 g minimum', () => {
    expect(quoteLocalShip(0, 'lite', LOCAL_SHIP_SEED)).toMatchObject({
      amountInr: 100,
      billedWeightKg: 0.5,
      extraKg: null
    });
    expect(quoteLocalShip(0.5, 'lite', LOCAL_SHIP_SEED)?.amountInr).toBe(100);
    expect(quoteLocalShip(0.501, 'lite', LOCAL_SHIP_SEED)?.amountInr).toBe(200);
    expect(quoteLocalShip(1, 'prime', LOCAL_SHIP_SEED)).toMatchObject({
      serviceName: 'DTDC Prime',
      amountInr: 350,
      billedWeightKg: 1
    });
    expect(quoteLocalShip(1.2, 'prime', LOCAL_SHIP_SEED)?.amountInr).toBe(450);
    expect(quoteLocalShip(2, 'plus', LOCAL_SHIP_SEED)?.amountInr).toBe(350);
    expect(quoteLocalShip(2.001, 'plus', LOCAL_SHIP_SEED)?.amountInr).toBe(450);
    expect(quoteLocalShip(3, 'lite', LOCAL_SHIP_SEED)?.amountInr).toBe(400);
    expect(quoteLocalShip(4, 'lite', LOCAL_SHIP_SEED)?.amountInr).toBe(500);
    expect(quoteLocalShip(5, 'plus', LOCAL_SHIP_SEED)?.amountInr).toBe(550);
  });

  test('adds whole kilograms after 5 kg on top of the 5 kg price', () => {
    expect(quoteLocalShip(5, 'lite', LOCAL_SHIP_SEED)).toMatchObject({
      amountInr: 500,
      extraKg: null
    });
    expect(quoteLocalShip(5.001, 'lite', LOCAL_SHIP_SEED)).toMatchObject({
      amountInr: 600,
      extraKg: 1,
      perKgRateInr: 100,
      billedWeightKg: 5
    });
    expect(quoteLocalShip(6, 'lite', LOCAL_SHIP_SEED)?.amountInr).toBe(600);
    expect(quoteLocalShip(7, 'plus', LOCAL_SHIP_SEED)?.amountInr).toBe(750);
    expect(quoteLocalShip(7.2, 'prime', LOCAL_SHIP_SEED)).toMatchObject({
      amountInr: 650 + 3 * 150,
      extraKg: 3,
      perKgRateInr: 150
    });
  });

  test('does not invent a price when that cell is missing', () => {
    const withoutTwoKg = LOCAL_SHIP_SEED.filter(
      (rate) => !(rate.service === 'prime' && rate.band === 'slab' && rate.weightKg === 2)
    );
    expect(quoteLocalShip(1.5, 'prime', withoutTwoKg)).toBeNull();
    expect(quoteLocalShip(1.5, 'lite', withoutTwoKg)?.amountInr).toBe(300);
    const withoutFive = LOCAL_SHIP_SEED.filter(
      (rate) => !(rate.service === 'lite' && rate.band === 'slab' && rate.weightKg === 5)
    );
    expect(quoteLocalShip(6, 'lite', withoutFive)).toBeNull();
    expect(quoteLocalShip(4, 'lite', withoutFive)).toBeNull();
    const withoutPerKg = LOCAL_SHIP_SEED.filter(
      (rate) => !(rate.service === 'plus' && rate.band === 'per_kg')
    );
    expect(quoteLocalShip(6, 'plus', withoutPerKg)).toBeNull();
    expect(quoteLocalShip(5, 'plus', withoutPerKg)?.amountInr).toBe(550);
    expect(quoteLocalShip(-1, 'lite', LOCAL_SHIP_SEED)).toBeNull();
    expect(quoteLocalShip(1, 'air', LOCAL_SHIP_SEED)).toBeNull();
    expect(quoteLocalShip(1, 'lite', [row('lite', 'slab', 4, 10)])).toBeNull();
  });
});

describe('India shipping save', () => {
  test('keeps a rupee amount and rejects a rate the card cannot price', () => {
    expect(
      normalizeLocalRates([{ service: 'prime', band: 'slab', weightKg: 2, amountInr: '450' }])
    ).toEqual([row('prime', 'slab', 2, 450)]);
    expect(
      normalizeLocalRates([{ service: 'lite', band: 'per_kg', weightKg: '5.0', amountInr: '1,00' }])
    ).toEqual([row('lite', 'per_kg', 5, 100)]);
    expect(normalizeLocalRates(LOCAL_SHIP_SEED)).toHaveLength(18);
    expect(() => normalizeLocalRates([])).toThrow(LocalShipError);
    expect(() =>
      normalizeLocalRates([{ service: 'air', band: 'slab', weightKg: 1, amountInr: 10 }])
    ).toThrow(LocalShipError);
    expect(() =>
      normalizeLocalRates([{ service: 'lite', band: 'slab', weightKg: 4, amountInr: 10 }])
    ).toThrow(LocalShipError);
    expect(() =>
      normalizeLocalRates([{ service: 'lite', band: 'per_kg', weightKg: 1, amountInr: 10 }])
    ).toThrow(LocalShipError);
    expect(() =>
      normalizeLocalRates([{ service: 'lite', band: 'slab', weightKg: 1, amountInr: -1 }])
    ).toThrow(LocalShipError);
    expect(() =>
      normalizeLocalRates([
        { service: 'lite', band: 'slab', weightKg: 1, amountInr: 10 },
        { service: 'lite', band: 'slab', weightKg: 1, amountInr: 20 }
      ])
    ).toThrow(LocalShipError);
  });
});
