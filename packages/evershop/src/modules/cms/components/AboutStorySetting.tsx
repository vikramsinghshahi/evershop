import {
  drawerInputClass,
  drawerTextareaClass,
  Field,
  ImagePickerField,
  Section,
  useScopedFormContext
} from '@components/common/page-builder/index.js';
import React from 'react';
import {
  ABOUT_STORY_DEFAULTS,
  type AboutStoryCopy
} from '../services/aboutStoryDefaults.js';

const PHOTOS: { key: keyof AboutStoryCopy; label: string }[] = [
  { key: 'heroImage', label: 'Opening photo' },
  { key: 'thenImage', label: 'Then photo' },
  { key: 'nowImage', label: 'Now photo' },
  { key: 'printImage', label: 'Printing photo' },
  { key: 'swatchImage', label: 'Small inset photo' },
  { key: 'materialsImage', label: 'Materials photo' }
];

const GROUPS: {
  title: string;
  fields: { key: keyof AboutStoryCopy; label: string; rows?: number }[];
}[] = [
  {
    title: 'Opening',
    fields: [
      { key: 'headline', label: 'Headline', rows: 2 },
      { key: 'lede', label: 'Introduction', rows: 4 },
      { key: 'ctaLabel', label: 'Button label' },
      { key: 'ctaUrl', label: 'Button link' }
    ]
  },
  {
    title: 'Figures',
    fields: [
      { key: 'stat1Value', label: 'First figure' },
      { key: 'stat1Label', label: 'First figure label' },
      { key: 'stat2Value', label: 'Second figure' },
      { key: 'stat2Label', label: 'Second figure label' },
      { key: 'stat3Value', label: 'Third figure' },
      { key: 'stat3Label', label: 'Third figure label' }
    ]
  },
  {
    title: 'Then and now',
    fields: [
      { key: 'thenLabel', label: 'Then label' },
      { key: 'thenText', label: 'Then text' },
      { key: 'nowLabel', label: 'Now label' },
      { key: 'nowText', label: 'Now text' }
    ]
  },
  {
    title: 'Journey',
    fields: [
      { key: 'journeyTitle', label: 'Heading', rows: 2 },
      { key: 'journeyBody', label: 'Paragraphs', rows: 6 }
    ]
  },
  {
    title: 'What we do',
    fields: [
      { key: 'workTitle', label: 'Heading' },
      { key: 'workIntro', label: 'Introduction', rows: 3 },
      { key: 'point1Title', label: 'Point 1 title' },
      { key: 'point1Text', label: 'Point 1 text', rows: 2 },
      { key: 'point2Title', label: 'Point 2 title' },
      { key: 'point2Text', label: 'Point 2 text', rows: 2 },
      { key: 'point3Title', label: 'Point 3 title' },
      { key: 'point3Text', label: 'Point 3 text', rows: 2 }
    ]
  },
  {
    title: 'Fabrics',
    fields: [
      { key: 'sustainTitle', label: 'Heading' },
      { key: 'sustainIntro', label: 'Introduction', rows: 3 },
      { key: 'sustainItems', label: 'Points, one per line', rows: 4 }
    ]
  },
  {
    title: 'Values',
    fields: [
      { key: 'valuesTitle', label: 'Heading' },
      { key: 'value1Kicker', label: 'First label' },
      { key: 'value1Title', label: 'First title' },
      { key: 'value1Text', label: 'Experience text', rows: 2 },
      { key: 'value2Kicker', label: 'Second label' },
      { key: 'value2Title', label: 'Second title' },
      { key: 'value2Text', label: 'Creativity text', rows: 2 },
      { key: 'value3Kicker', label: 'Third label' },
      { key: 'value3Title', label: 'Third title' },
      { key: 'value3Text', label: 'Partnership text', rows: 2 }
    ]
  },
  {
    title: 'Closing',
    fields: [
      { key: 'closeTitle', label: 'Heading', rows: 2 },
      { key: 'closeText', label: 'Text', rows: 3 },
      { key: 'closeCtaLabel', label: 'Button label' },
      { key: 'closeCtaUrl', label: 'Button link' }
    ]
  }
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

function StoryField({
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

export default function AboutStorySetting({
  aboutStoryWidget
}: {
  aboutStoryWidget?: Partial<AboutStoryCopy> | null;
}) {
  return (
    <div className="space-y-3">
      <Section title="Photos">
        {PHOTOS.map((field) => (
          <PhotoField
            key={field.key}
            name={field.key}
            label={field.label}
            fallback={
              aboutStoryWidget?.[field.key] || ABOUT_STORY_DEFAULTS[field.key]
            }
          />
        ))}
        <p className="text-xs text-muted-foreground">
          Choose a photo from the file browser. Clear it to use the photo
          shipped with the page. The upload goes to the store file storage.
        </p>
      </Section>
      {GROUPS.map((group) => (
        <Section key={group.title} title={group.title}>
          {group.fields.map((field) => (
            <StoryField
              key={field.key}
              name={field.key}
              label={field.label}
              rows={field.rows}
              fallback={aboutStoryWidget?.[field.key]}
            />
          ))}
        </Section>
      ))}
      <p className="text-xs text-muted-foreground">
        Leave a line blank to hide it. A blank line between journey paragraphs
        starts a new paragraph.
      </p>
    </div>
  );
}
