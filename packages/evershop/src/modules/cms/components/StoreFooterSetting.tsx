import {
  asArray,
  drawerInputClass,
  Field,
  RepeatableAccordion,
  Section,
  Toggle,
  useArraySetting,
  useScopedFormContext
} from '@components/common/page-builder/index.js';
import { LinkPicker } from '@components/common/page-builder/pickers/LinkPicker.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';
import type { StoreFooterColumn, StoreFooterLink } from './StoreFooter.js';

interface StoreFooterSettingProps {
  storeFooterWidget?: {
    heading?: string;
    tagline?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    city?: string;
    contactTitle?: string;
    columns?: StoreFooterColumn[];
  };
}

function makeId(prefix: string): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeBlankLink(): StoreFooterLink {
  return {
    id: makeId('lnk'),
    label: _('New line'),
    url: '',
    newTab: false,
    nofollow: false,
    noReferrer: false
  };
}

function makeBlankColumn(): StoreFooterColumn {
  return { id: makeId('col'), title: _('New column'), links: [makeBlankLink()] };
}

function textOf(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

export default function StoreFooterSetting({
  storeFooterWidget
}: StoreFooterSettingProps) {
  const initial = storeFooterWidget ?? {};
  const initialColumns = initial.columns ?? [];
  const { register, setValue, getValues, watch } = useScopedFormContext();

  const columns = useArraySetting<StoreFooterColumn>(
    'settings.columns',
    initialColumns
  );
  const heading = textOf(watch('settings.heading'), initial.heading ?? '');
  const tagline = textOf(watch('settings.tagline'), initial.tagline ?? '');
  const email = textOf(watch('settings.email'), initial.email ?? '');
  const phone = textOf(watch('settings.phone'), initial.phone ?? '');
  const whatsapp = textOf(watch('settings.whatsapp'), initial.whatsapp ?? '');
  const city = textOf(watch('settings.city'), initial.city ?? '');
  const contactTitle = textOf(
    watch('settings.contactTitle'),
    initial.contactTitle ?? 'Contact'
  );

  const setText = (name: string, value: string) => {
    setValue(name, value, { shouldDirty: true });
  };

  const readColumns = (): StoreFooterColumn[] =>
    asArray<StoreFooterColumn>(getValues('settings.columns'), initialColumns);

  const updateColumn = (i: number, patch: Partial<StoreFooterColumn>) => {
    const current = readColumns();
    setValue(
      'settings.columns',
      current.map((col, idx) => (idx === i ? { ...col, ...patch } : col)),
      { shouldDirty: true }
    );
  };
  const moveColumn = (from: number, to: number) => {
    const current = readColumns();
    if (to < 0 || to >= current.length) return;
    const next = current.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setValue('settings.columns', next, { shouldDirty: true });
  };
  const removeColumn = (i: number) => {
    const current = readColumns();
    if (current.length <= 1) return;
    setValue(
      'settings.columns',
      current.filter((_, idx) => idx !== i),
      { shouldDirty: true }
    );
  };
  const addColumn = () => {
    const current = readColumns();
    if (current.length >= 4) return;
    setValue('settings.columns', [...current, makeBlankColumn()], {
      shouldDirty: true
    });
  };
  const updateLink = (
    colIdx: number,
    linkIdx: number,
    patch: Partial<StoreFooterLink>
  ) => {
    const col = readColumns()[colIdx];
    if (!col) return;
    updateColumn(colIdx, {
      links: (col.links ?? []).map((link, i) =>
        i === linkIdx ? { ...link, ...patch } : link
      )
    });
  };
  const moveLink = (colIdx: number, from: number, to: number) => {
    const col = readColumns()[colIdx];
    if (!col) return;
    const links = col.links ?? [];
    if (to < 0 || to >= links.length) return;
    const next = links.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    updateColumn(colIdx, { links: next });
  };
  const removeLink = (colIdx: number, linkIdx: number) => {
    const col = readColumns()[colIdx];
    if (!col || (col.links ?? []).length <= 1) return;
    updateColumn(colIdx, {
      links: col.links.filter((_, i) => i !== linkIdx)
    });
  };
  const addLink = (colIdx: number) => {
    const col = readColumns()[colIdx];
    if (!col || (col.links ?? []).length >= 8) return;
    updateColumn(colIdx, { links: [...(col.links ?? []), makeBlankLink()] });
  };

  return (
    <div className="space-y-3">
      <Section title={_('Brand')}>
        <Field label={_('Name')}>
          <input
            type="text"
            value={heading}
            onChange={(e) => setText('settings.heading', e.target.value)}
            className={drawerInputClass}
          />
        </Field>
        <Field label={_('Tagline')}>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setText('settings.tagline', e.target.value)}
            className={drawerInputClass}
          />
        </Field>
      </Section>

      <Section title={_('Contact')}>
        <Field label={_('Column title')}>
          <input
            type="text"
            value={contactTitle}
            onChange={(e) => setText('settings.contactTitle', e.target.value)}
            className={drawerInputClass}
          />
        </Field>
        <Field label={_('Email')}>
          <input
            type="email"
            value={email}
            onChange={(e) => setText('settings.email', e.target.value)}
            placeholder="hello@example.com"
            className={drawerInputClass}
          />
        </Field>
        <Field label={_('Phone')}>
          <input
            type="text"
            value={phone}
            onChange={(e) => setText('settings.phone', e.target.value)}
            placeholder="+91 98765 43210"
            className={drawerInputClass}
          />
        </Field>
        <Field
          label={_('WhatsApp')}
          hint={_('A phone number, or a full https://wa.me link.')}
        >
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setText('settings.whatsapp', e.target.value)}
            placeholder="+91 98765 43210"
            className={drawerInputClass}
          />
        </Field>
        <Field label={_('City')}>
          <input
            type="text"
            value={city}
            onChange={(e) => setText('settings.city', e.target.value)}
            className={drawerInputClass}
          />
        </Field>
      </Section>

      <Section title={_('Columns')}>
        <RepeatableAccordion<StoreFooterColumn>
          items={columns}
          onAdd={addColumn}
          onRemove={removeColumn}
          onMove={moveColumn}
          addLabel={_('Add column')}
          minItems={1}
          maxItems={4}
          initiallyOpenFirst
          renderHeader={({ item }) =>
            _('${title} · ${count} lines', {
              title: item.title || _('Untitled'),
              count: String(item.links?.length ?? 0)
            })
          }
          renderItem={({ item, index }) => (
            <>
              <Field label={_('Column title')}>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) =>
                    updateColumn(index, { title: e.target.value })
                  }
                  className={drawerInputClass}
                />
              </Field>
              <Field
                label={_('Lines')}
                hint={_('Leave the link empty to show the line as text.')}
              >
                <RepeatableAccordion<StoreFooterLink>
                  items={item.links ?? []}
                  onAdd={() => addLink(index)}
                  onRemove={(i) => removeLink(index, i)}
                  onMove={(from, to) => moveLink(index, from, to)}
                  addLabel={_('Add line')}
                  minItems={1}
                  maxItems={8}
                  renderHeader={({ item: link }) =>
                    link.label || _('Untitled')
                  }
                  renderItem={({ item: link, index: linkIdx }) => (
                    <>
                      <Field label={_('Label')}>
                        <input
                          type="text"
                          value={link.label || ''}
                          onChange={(e) =>
                            updateLink(index, linkIdx, {
                              label: e.target.value
                            })
                          }
                          className={drawerInputClass}
                        />
                      </Field>
                      <Field label={_('Link')}>
                        <LinkPicker
                          value={link.url || ''}
                          initialKind="custom"
                          onChange={({ url }) =>
                            updateLink(index, linkIdx, { url })
                          }
                        />
                      </Field>
                      <Toggle
                        label={_('Open in new tab')}
                        checked={!!link.newTab}
                        onChange={(v) =>
                          updateLink(index, linkIdx, { newTab: v })
                        }
                      />
                    </>
                  )}
                />
              </Field>
            </>
          )}
        />
      </Section>

      <input
        type="hidden"
        {...register('settings.heading')}
        defaultValue={initial.heading ?? ''}
      />
      <input
        type="hidden"
        {...register('settings.tagline')}
        defaultValue={initial.tagline ?? ''}
      />
      <input
        type="hidden"
        {...register('settings.email')}
        defaultValue={initial.email ?? ''}
      />
      <input
        type="hidden"
        {...register('settings.phone')}
        defaultValue={initial.phone ?? ''}
      />
      <input
        type="hidden"
        {...register('settings.whatsapp')}
        defaultValue={initial.whatsapp ?? ''}
      />
      <input
        type="hidden"
        {...register('settings.city')}
        defaultValue={initial.city ?? ''}
      />
      <input
        type="hidden"
        {...register('settings.contactTitle')}
        defaultValue={initial.contactTitle ?? 'Contact'}
      />
      <input
        type="hidden"
        {...register('settings.columns')}
        defaultValue={JSON.stringify(initialColumns)}
      />
    </div>
  );
}

export const query = `
  query Query(
    $heading: String
    $tagline: String
    $email: String
    $phone: String
    $whatsapp: String
    $city: String
    $contactTitle: String
    $columns: JSON
  ) {
    storeFooterWidget(
      heading: $heading
      tagline: $tagline
      email: $email
      phone: $phone
      whatsapp: $whatsapp
      city: $city
      contactTitle: $contactTitle
      columns: $columns
    ) {
      heading
      tagline
      email
      phone
      whatsapp
      city
      contactTitle
      columns
    }
  }
`;

export const variables = `{
  heading: getWidgetSetting("heading", ""),
  tagline: getWidgetSetting("tagline", ""),
  email: getWidgetSetting("email", ""),
  phone: getWidgetSetting("phone", ""),
  whatsapp: getWidgetSetting("whatsapp", ""),
  city: getWidgetSetting("city", ""),
  contactTitle: getWidgetSetting("contactTitle", "Contact"),
  columns: getWidgetSetting("columns", [])
}`;
