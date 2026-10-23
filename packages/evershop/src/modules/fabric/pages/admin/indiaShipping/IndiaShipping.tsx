import { SettingMenu } from '@components/admin/SettingMenu.js';
import { Button } from '@components/common/ui/Button.js';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import React, { useState } from 'react';
import {
  LOCAL_BANDS,
  LOCAL_SERVICES,
  localCardLabel,
  type LocalBandKind,
  type LocalRateRow,
  type LocalService
} from '../../../services/localShipQuote.js';

interface IndiaShippingProps {
  fabricLocalShipRates?: LocalRateRow[];
  saveLocalShipRatesApi: string;
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

export default function IndiaShipping({
  fabricLocalShipRates = [],
  saveLocalShipRatesApi
}: IndiaShippingProps) {
  const [rates, setRates] = useState(fabricLocalShipRates);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const amountAt = (service: LocalService, band: LocalBandKind, weightKg: number) =>
    rates.find(
      (rate) => rate.service === service && rate.band === band && rate.weightKg === weightKg
    )?.amountInr ?? '';

  const setAmount = (
    service: LocalService,
    band: LocalBandKind,
    weightKg: number,
    raw: string
  ) => {
    const cleaned = raw.replace(/,/g, '').trim();
    const amountInr = cleaned === '' ? 0 : Number(cleaned);
    setRates((current) => {
      const next = current.filter(
        (rate) =>
          !(rate.service === service && rate.band === band && rate.weightKg === weightKg)
      );
      if (cleaned !== '' && Number.isFinite(amountInr) && amountInr >= 0) {
        next.push({ service, band, weightKg, amountInr });
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
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>India rates</CardTitle>
              <CardDescription>
                Prices for a shipping address in India. Checkout offers DTDC Lite,
                DTDC Plus, and DTDC Prime. Up to 5 kg, the row that covers the
                parcel is charged, and anything up to 500 g uses the first row.
                Above 5 kg, the 3–5 kg price plus each extra kilogram, rounded up.
                The number in each box is what the customer pays. It starts at the
                high end of the DTDC band printed under the box, so ₹40–100 starts
                at ₹100. Type a lower number for the cheaper end of that band. An
                empty box removes that price. Export rates and the export surcharge
                are not added. A saved price reaches open carts within about two
                minutes. Orders already placed keep their price.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-2 py-2 font-medium">Weight</th>
                      {LOCAL_SERVICES.map((service) => (
                        <th key={service.code} className="px-2 py-2 text-center font-medium">
                          {service.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {LOCAL_BANDS.map((band) => (
                      <tr key={`${band.band}:${band.weightKg}`} className="border-b border-border">
                        <th className="px-2 py-2 text-left font-medium whitespace-nowrap">
                          {band.label}
                        </th>
                        {LOCAL_SERVICES.map((service) => (
                          <td key={service.code} className="px-2 py-2">
                            <input
                              aria-label={`${band.label} ${service.name}`}
                              className="h-9 w-full rounded-md border border-input bg-background px-2 text-right tabular-nums"
                              inputMode="decimal"
                              value={amountAt(service.code, band.band, band.weightKg)}
                              onChange={(event) =>
                                setAmount(
                                  service.code,
                                  band.band,
                                  band.weightKg,
                                  event.target.value
                                )
                              }
                            />
                            <p className="mt-1 text-center text-[11px] text-muted-foreground">
                              {localCardLabel(band, service.code)}
                            </p>
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
                  disabled={saving}
                  onClick={async () => {
                    setSaving(true);
                    setMessage('');
                    try {
                      const error = await postJson(saveLocalShipRatesApi, { rates });
                      setMessage(error ?? 'Rates saved');
                    } catch {
                      setMessage('Could not save');
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  Save rates
                </Button>
                {message && <p className="text-sm text-muted-foreground">{message}</p>}
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
    fabricLocalShipRates {
      service
      band
      weightKg
      amountInr
    }
    saveLocalShipRatesApi: url(routeId: "saveLocalShipRates")
  }
`;
