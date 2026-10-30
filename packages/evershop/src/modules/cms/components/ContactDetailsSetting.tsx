import {
  drawerInputClass,
  drawerTextareaClass,
  Field,
  ImagePickerField,
  Section,
  useScopedFormContext
} from '@components/common/page-builder/index.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';
import { useQuery } from 'urql';
import {
  CONTACT_PAGE_DEFAULTS,
  type ContactPageCopy
} from '../services/contactPageDefaults.js';

const PHOTOS: { key: keyof ContactPageCopy; label: string }[] = [
  { key: 'heroImage', label: 'Banner photo' },
  { key: 'sideImage', label: 'Side photo' }
];

const StoreContactQuery = `
  query StoreContactNote {
    setting {
      storeEmail
      storePhoneNumber
    }
    storeSettingUrl: url(routeId: "storeSetting")
  }
`;

const FIELDS: { key: keyof ContactPageCopy; label: string; rows?: number }[] = [
  { key: 'eyebrow', label: 'Eyebrow' },
  { key: 'headline', label: 'Heading' },
  { key: 'intro', label: 'Introduction', rows: 4 },
  { key: 'note', label: 'Note under the heading', rows: 3 },
  { key: 'addressLabel', label: 'Address label' },
  { key: 'emailLabel', label: 'Email label' },
  { key: 'phoneLabel', label: 'Phone label' },
  { key: 'secondEmail', label: 'Second email' },
  { key: 'highlight1Title', label: 'Highlight 1 title' },
  { key: 'highlight1Text', label: 'Highlight 1 text' },
  { key: 'highlight2Title', label: 'Highlight 2 title' },
  { key: 'highlight2Text', label: 'Highlight 2 text' },
  { key: 'highlight3Title', label: 'Highlight 3 title' },
  { key: 'highlight3Text', label: 'Highlight 3 text' },
  { key: 'highlight4Title', label: 'Highlight 4 title' },
  { key: 'highlight4Text', label: 'Highlight 4 text' }
];

function PhotoField({
  name,
  label,
  fallback
}: {
  name: string;
  label: string;
  fallback: string;
}) {
  const { watch, setValue } = useScopedFormContext();
  const stored = watch(`settings.${name}`);
  const value =
    typeof stored === 'string' && stored.trim() ? stored.trim() : fallback;
  return (
    <Field label={label}>
      <ImagePickerField
        value={value}
        onChange={(next) =>
          setValue(`settings.${name}`, next || fallback, { shouldDirty: true })
        }
      />
    </Field>
  );
}

function CopyField({
  name,
  label,
  rows,
  fallback
}: {
  name: string;
  label: string;
  rows?: number;
  fallback?: string | null;
}) {
  const { watch, setValue } = useScopedFormContext();
  const stored = watch(`settings.${name}`);
  const value =
    typeof stored === 'string'
      ? stored
      : typeof fallback === 'string'
        ? fallback
        : '';
  const onChange = (next: string) =>
    setValue(`settings.${name}`, next, { shouldDirty: true });
  return (
    <Field label={label}>
      {rows ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={drawerTextareaClass}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={drawerInputClass}
        />
      )}
    </Field>
  );
}

export default function ContactDetailsSetting({
  contactDetailsWidget
}: {
  contactDetailsWidget?: Partial<ContactPageCopy> | null;
}) {
  const [{ data }] = useQuery({ query: StoreContactQuery });
  const email = data?.setting?.storeEmail || '';
  const phone = data?.setting?.storePhoneNumber || '';
  const storeUrl = data?.storeSettingUrl || '/admin/setting/store';

  return (
    <div className="space-y-3">
      <Section title={_('Store contact')}>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {_('The address, phone, and primary email on this page come from Store settings. The form under the page sends to that same email.')}
        </p>
        <p className="text-sm">
          {email || _('No store email yet')}
          {phone ? ` · ${phone}` : ''}
        </p>
        <a href={storeUrl} className="text-sm text-primary">
          {_('Edit store contact')}
        </a>
      </Section>
      <Section title={_('Photos')}>
        {PHOTOS.map((field) => (
          <PhotoField
            key={field.key}
            name={field.key}
            label={_(field.label)}
            fallback={
              contactDetailsWidget?.[field.key] ||
              CONTACT_PAGE_DEFAULTS[field.key]
            }
          />
        ))}
        <p className="text-xs text-muted-foreground">
          {_('Choose a photo from the file browser. Clear it to use the photo shipped with the page. The upload goes to the store file storage.')}
        </p>
      </Section>
      <Section title={_('Page wording')}>
        {FIELDS.map((field) => (
          <CopyField
            key={field.key}
            name={field.key}
            label={field.label}
            rows={field.rows}
            fallback={contactDetailsWidget?.[field.key]}
          />
        ))}
      </Section>
      <p className="text-xs text-muted-foreground">
        {_('The second email is shown beside the store email. Clear it to hide it. Leave any other line blank to hide that line.')}
      </p>
    </div>
  );
}
