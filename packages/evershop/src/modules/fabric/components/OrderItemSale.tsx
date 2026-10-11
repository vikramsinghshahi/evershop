import { Button } from '@components/common/ui/Button.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';
import { SALE_UNITS, saleUnitLabel } from '../services/saleUnit.js';

interface OrderItemSaleProps {
  saleUnit: string | null;
  moq: number | null;
  updateSaleApi: string;
}

/**
 * Unit and minimum order on an admin order line. Saving changes this order
 * only; the product keeps its own values for the next order.
 */
export function OrderItemSale({
  saleUnit,
  moq,
  updateSaleApi
}: OrderItemSaleProps) {
  const [unit, setUnit] = React.useState(saleUnit || 'none');
  const [minimum, setMinimum] = React.useState(
    moq != null ? String(moq) : saleUnit ? '1' : ''
  );
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const response = await fetch(updateSaleApi, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sale_unit: unit === 'none' ? null : unit,
          moq: minimum === '' ? null : Number(minimum)
        })
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message || _('Could not save the unit'));
      }
      window.location.reload();
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  };

  return (
    <div className="mt-2 flex flex-wrap items-end gap-2">
      <label className="text-xs text-muted-foreground">
        {_('Unit')}
        <select
          className="mt-1 block h-8 rounded-md border border-border bg-background px-2 text-sm text-foreground"
          value={unit}
          onChange={(event) => setUnit(event.target.value)}
        >
          <option value="none">{_('None')}</option>
          {SALE_UNITS.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {_(entry.label)}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-muted-foreground">
        {_('MOQ')}
        <input
          type="number"
          min={1}
          className="mt-1 block h-8 w-20 rounded-md border border-border bg-background px-2 text-sm text-foreground"
          value={minimum}
          onChange={(event) => setMinimum(event.target.value)}
        />
      </label>
      <Button type="button" size="sm" variant="outline" onClick={save} isLoading={saving}>
        {_('Save')}
      </Button>
      {unit !== 'none' && (
        <span className="pb-1 text-xs text-muted-foreground">
          {_('MOQ')}: {minimum || 1} {saleUnitLabel(unit)}
        </span>
      )}
      {error && <span className="pb-1 text-xs text-destructive">{error}</span>}
    </div>
  );
}
