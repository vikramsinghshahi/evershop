import {
  drawerInputClass,
  drawerTextareaClass,
  Field,
  ImagePickerField,
  Section,
  useScopedFormContext
} from '@components/common/page-builder/index.js';
import React from 'react';
import { companyPhoto } from '../services/companyImages.js';
import {
  TERMS_PAGE_DEFAULTS,
  type TermsPageCopy
} from '../services/termsPageDefaults.js';

const OPENING: { key: keyof TermsPageCopy; label: string; rows?: number }[] = [
  { key: 'eyebrow', label: 'Small line' },
  { key: 'title', label: 'Heading', rows: 2 },
  { key: 'intro', label: 'Introduction', rows: 3 },
  { key: 'heroCaption', label: 'Words on the photo', rows: 3 }
];

function PhotoField({ fallback }: { fallback: string }) {
  const { watch, setValue } = useScopedFormContext();
  const stored = watch('settings.heroImage');
  const value = companyPhoto(
    typeof stored === 'string' ? stored : fallback,
    fallback
  );
  return (
    <Field label="Opening photo">
      <ImagePickerField
        value={value}
        onChange={(next) =>
          setValue('settings.heroImage', next || fallback, { shouldDirty: true })
        }
      />
    </Field>
  );
}

function TextField({
  name,
  label,
  rows,
  fallback
}: {
  name: keyof TermsPageCopy;
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

export default function TermsPageSetting({
  termsPageWidget
}: {
  termsPageWidget?: Partial<TermsPageCopy> | null;
}) {
  const stored = termsPageWidget ?? {};
  return (
    <div className="space-y-3">
      <Section title="Opening">
        {OPENING.map((field) => (
          <TextField
            key={field.key}
            name={field.key}
            label={field.label}
            rows={field.rows}
            fallback={stored[field.key]}
          />
        ))}
        <PhotoField
          fallback={stored.heroImage || TERMS_PAGE_DEFAULTS.heroImage}
        />
        <p className="text-xs text-muted-foreground">
          Clear the photo to use the one shipped with the page. Leave a line
          blank to hide it.
        </p>
      </Section>
      <Section title="Clauses">
        {Array.from({ length: 10 }, (_, index) => {
          const number = index + 1;
          const title = `section${number}Title` as keyof TermsPageCopy;
          const body = `section${number}Body` as keyof TermsPageCopy;
          return (
            <div key={number} className="space-y-2">
              <TextField
                name={title}
                label={`Clause ${number} heading`}
                fallback={stored[title]}
              />
              <TextField
                name={body}
                label={`Clause ${number} points`}
                rows={4}
                fallback={stored[body]}
              />
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground">
          Put each point on its own line. A blank heading and blank points hide
          that clause.
        </p>
      </Section>
      <Section title="Closing">
        <TextField
          name="closeKicker"
          label="Script line"
          fallback={stored.closeKicker}
        />
        <TextField
          name="closeBrand"
          label="Brand line"
          fallback={stored.closeBrand}
        />
        {([1, 2, 3, 4] as const).map((number) => {
          const key = `value${number}` as keyof TermsPageCopy;
          return (
            <TextField
              key={key}
              name={key}
              label={`Value ${number}`}
              fallback={stored[key]}
            />
          );
        })}
      </Section>
    </div>
  );
}
