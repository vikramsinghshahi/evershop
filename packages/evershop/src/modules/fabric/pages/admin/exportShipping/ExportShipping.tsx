import { SettingMenu } from '@components/admin/SettingMenu.js';
import { Button } from '@components/common/ui/Button.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import { COUNTRIES } from '@evershop/evershop/lib/address/data/countries.js';
import React, { useMemo, useState } from 'react';

interface CountryRow {
  countryCode: string;
  countryName: string;
  zone: number;
}

interface RateRow {
  band: 'slab' | 'per_kg';
  weightKg: number;
  zone: number;
  amountInr: number;
}

interface ExportShippingProps {
  fabricShipCountries?: CountryRow[];
  fabricShipRates?: RateRow[];
  saveShipCountriesApi: string;
  saveShipRatesApi: string;
}

const ZONES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function rateKey(band: string, weightKg: number): string {
  return `${band}:${weightKg}`;
}

function weightLabel(band: string, weightKg: number): string {
  return band === 'per_kg' ? `${weightKg}+ kg` : `${weightKg} kg`;
}

async function postJson(url: string, body: unknown): Promise<string | null> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const json = (await response.json()) as { error?: { message?: string } };
  if (!response.ok) {
    return json.error?.message || 'Could not save';
  }
  return null;
}

export default function ExportShipping({
  fabricShipCountries = [],
  fabricShipRates = [],
  saveShipCountriesApi,
  saveShipRatesApi
}: ExportShippingProps) {
  const [countries, setCountries] = useState(fabricShipCountries);
  const [rates, setRates] = useState(fabricShipRates);
  const [filter, setFilter] = useState('');
  const [addCode, setAddCode] = useState('');
  const [countryMessage, setCountryMessage] = useState('');
  const [rateMessage, setRateMessage] = useState('');
  const [savingCountries, setSavingCountries] = useState(false);
  const [savingRates, setSavingRates] = useState(false);

  const shown = useMemo(() => {
    const text = filter.trim().toLowerCase();
    if (!text) {
      return countries;
    }
    return countries.filter(
      (country) =>
        country.countryName.toLowerCase().includes(text) ||
        country.countryCode.toLowerCase().includes(text) ||
        String(country.zone) === text
    );
  }, [countries, filter]);

  const unused = useMemo(
    () =>
      COUNTRIES.filter(
        (country) => !countries.some((row) => row.countryCode === country.code)
      ),
    [countries]
  );

  const rateRows = useMemo(() => {
    const grouped = new Map<string, { band: RateRow['band']; weightKg: number }>();
    for (const rate of fabricShipRates) {
      grouped.set(rateKey(rate.band, rate.weightKg), {
        band: rate.band,
        weightKg: rate.weightKg
      });
    }
    return [...grouped.values()].sort((a, b) => {
      if (a.band !== b.band) {
        return a.band === 'slab' ? -1 : 1;
      }
      return a.weightKg - b.weightKg;
    });
  }, [fabricShipRates]);

  const amountAt = (band: string, weightKg: number, zone: number) =>
    rates.find(
      (rate) => rate.band === band && rate.weightKg === weightKg && rate.zone === zone
    )?.amountInr ?? '';

  const setAmount = (band: RateRow['band'], weightKg: number, zone: number, raw: string) => {
    const cleaned = raw.replace(/,/g, '').trim();
    const amountInr = cleaned === '' ? 0 : Number(cleaned);
    setRates((current) => {
      const next = current.filter(
        (rate) =>
          !(rate.band === band && rate.weightKg === weightKg && rate.zone === zone)
      );
      if (cleaned !== '' && Number.isFinite(amountInr) && amountInr >= 0) {
        next.push({ band, weightKg, zone, amountInr });
      }
      return next;
    });
  };

  return (
    <div className="main-content-inner">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <SettingMenu />
        </div>
        <div className="lg:col-span-4 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Export rates</CardTitle>
              <CardDescription>
                Prices are rupees. Up to 20 kg, the half-kilogram row that covers
                the parcel is charged. Above that, the 20 kg price plus each extra
                kilogram at the 21+, 45+, or 71+ rate. Checkout divides that rupee
                amount by the exchange rate and does not add the fabric margin.
                The zone, weight, rupee price, and rate are stored on the order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[52rem] border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="sticky left-0 bg-card px-2 py-2 font-medium">Weight</th>
                      {ZONES.map((zone) => (
                        <th key={zone} className="px-1 py-2 text-center font-medium">
                          {zone}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rateRows.map((row) => (
                      <tr key={rateKey(row.band, row.weightKg)} className="border-b border-border">
                        <th className="sticky left-0 bg-card px-2 py-1 text-left font-medium whitespace-nowrap">
                          {weightLabel(row.band, row.weightKg)}
                        </th>
                        {ZONES.map((zone) => (
                          <td key={zone} className="px-1 py-1">
                            <input
                              aria-label={`${weightLabel(row.band, row.weightKg)} zone ${zone}`}
                              className="h-8 w-full min-w-[4.5rem] rounded-md border border-input bg-background px-1.5 text-right tabular-nums"
                              inputMode="decimal"
                              value={amountAt(row.band, row.weightKg, zone)}
                              onChange={(event) =>
                                setAmount(row.band, row.weightKg, zone, event.target.value)
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Button
                  type="button"
                  disabled={savingRates}
                  onClick={async () => {
                    setSavingRates(true);
                    setRateMessage('');
                    const error = await postJson(saveShipRatesApi, { rates });
                    setRateMessage(error ?? 'Rates saved');
                    setSavingRates(false);
                  }}
                >
                  Save rates
                </Button>
                {rateMessage && <p className="text-sm text-muted-foreground">{rateMessage}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zones</CardTitle>
              <CardDescription>
                A country that is not on this list has no export price. India stays
                on its own shipping method.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex flex-col gap-2 sm:flex-row">
                <input
                  aria-label="Find a country"
                  className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                  placeholder="Find a country"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                />
                <select
                  aria-label="Add a country"
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={addCode}
                  onChange={(event) => {
                    const code = event.target.value;
                    setAddCode('');
                    if (!code) {
                      return;
                    }
                    const country = COUNTRIES.find((item) => item.code === code);
                    if (!country) {
                      return;
                    }
                    setCountries((current) =>
                      [...current, { countryCode: code, countryName: country.name, zone: 1 }].sort(
                        (a, b) => a.countryName.localeCompare(b.countryName)
                      )
                    );
                  }}
                >
                  <option value="">Add a country</option>
                  {unused.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="max-h-[28rem] overflow-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-2 py-2 font-medium">Country</th>
                      <th className="w-24 px-2 py-2 font-medium">Zone</th>
                      <th className="w-16 px-2 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((country) => (
                      <tr key={country.countryCode} className="border-b border-border">
                        <td className="px-2 py-1.5">
                          {country.countryName}
                          <span className="ml-2 text-xs text-muted-foreground">
                            {country.countryCode}
                          </span>
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            aria-label={`${country.countryName} zone`}
                            className="h-8 w-16 rounded-md border border-input bg-background px-2 text-right tabular-nums"
                            inputMode="numeric"
                            value={country.zone}
                            onChange={(event) => {
                              const zone = Number(event.target.value);
                              setCountries((current) =>
                                current.map((row) =>
                                  row.countryCode === country.countryCode
                                    ? { ...row, zone: Number.isFinite(zone) ? zone : row.zone }
                                    : row
                                )
                              );
                            }}
                          />
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          <button
                            type="button"
                            className="text-xs text-muted-foreground underline"
                            onClick={() =>
                              setCountries((current) =>
                                current.filter((row) => row.countryCode !== country.countryCode)
                              )
                            }
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Button
                  type="button"
                  disabled={savingCountries}
                  onClick={async () => {
                    setSavingCountries(true);
                    setCountryMessage('');
                    const error = await postJson(saveShipCountriesApi, { countries });
                    setCountryMessage(error ?? 'Zones saved');
                    setSavingCountries(false);
                  }}
                >
                  Save zones
                </Button>
                {countryMessage && (
                  <p className="text-sm text-muted-foreground">{countryMessage}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    fabricShipCountries {
      countryCode
      countryName
      zone
    }
    fabricShipRates {
      band
      weightKg
      zone
      amountInr
    }
    saveShipCountriesApi: url(routeId: "saveShipCountries")
    saveShipRatesApi: url(routeId: "saveShipRates")
  }
`;
