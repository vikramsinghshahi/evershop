import {
  CircleDollarSign,
  Diamond,
  FilePen,
  FileText,
  Handshake,
  Leaf,
  Lock,
  Package,
  Palette,
  PenLine,
  Scale,
  ShieldCheck,
  Truck,
  type LucideIcon
} from 'lucide-react';
import React from 'react';
import { companyPhoto } from '../services/companyImages.js';
import {
  TERMS_PAGE_DEFAULTS,
  type TermsPageCopy
} from '../services/termsPageDefaults.js';

const CLAUSES: {
  title: keyof TermsPageCopy;
  body: keyof TermsPageCopy;
  icon: LucideIcon;
  tint: string;
  ink: string;
}[] = [
  { title: 'section1Title', body: 'section1Body', icon: FileText, tint: '#e7f0ff', ink: '#3b6fd6' },
  { title: 'section2Title', body: 'section2Body', icon: CircleDollarSign, tint: '#e5f6ee', ink: '#2f9d6a' },
  { title: 'section3Title', body: 'section3Body', icon: Truck, tint: '#fff0e6', ink: '#e07a2f' },
  { title: 'section4Title', body: 'section4Body', icon: Palette, tint: '#f3e9ff', ink: '#8a5ad6' },
  { title: 'section5Title', body: 'section5Body', icon: Package, tint: '#fff1e4', ink: '#e08a3c' },
  { title: 'section6Title', body: 'section6Body', icon: ShieldCheck, tint: '#e5f7f4', ink: '#2a9d8f' },
  { title: 'section7Title', body: 'section7Body', icon: Lock, tint: '#fde8f1', ink: '#d4537e' },
  { title: 'section8Title', body: 'section8Body', icon: Scale, tint: '#fff6df', ink: '#c4922a' },
  { title: 'section9Title', body: 'section9Body', icon: Handshake, tint: '#e7f6ea', ink: '#3d9a56' },
  { title: 'section10Title', body: 'section10Body', icon: FilePen, tint: '#e7f0ff', ink: '#3b6fd6' }
];

const VALUES: { key: keyof TermsPageCopy; icon: LucideIcon }[] = [
  { key: 'value1', icon: Diamond },
  { key: 'value2', icon: PenLine },
  { key: 'value3', icon: Leaf },
  { key: 'value4', icon: Handshake }
];

function copy(value: string | null | undefined, fallback: string): string {
  return value == null ? fallback : value;
}

function lines(value: string): string[] {
  return value
    .split('\n')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export default function TermsPage({
  termsPageWidget
}: {
  termsPageWidget: Partial<TermsPageCopy> | null;
}) {
  const source = termsPageWidget ?? {};
  const field = (key: keyof TermsPageCopy) =>
    copy(source[key], TERMS_PAGE_DEFAULTS[key]);

  const clauses = CLAUSES.map((clause) => ({
    ...clause,
    heading: field(clause.title).trim(),
    points: lines(field(clause.body))
  })).filter((clause) => clause.heading || clause.points.length > 0);

  const values = VALUES.map((item) => ({
    ...item,
    label: field(item.key).trim()
  })).filter((item) => item.label);

  const eyebrow = field('eyebrow').trim();
  const title = field('title').trim();
  const intro = field('intro').trim();
  const caption = field('heroCaption').trim();
  const hero = companyPhoto(source.heroImage, TERMS_PAGE_DEFAULTS.heroImage);
  const closeKicker = field('closeKicker').trim();
  const closeBrand = field('closeBrand').trim();

  return (
    <article className="terms-page py-6 text-[#1c2f6b] sm:py-8">
      <header className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h1 className="mt-2 font-serif text-4xl leading-[1.05] font-semibold sm:text-5xl">
              {title}
            </h1>
          ) : null}
          {intro ? (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#4c5872]">
              {intro}
            </p>
          ) : null}
          <span className="mt-4 block h-1 w-14 rounded-full bg-[#e0b15a]" />
        </div>
        <div className="relative min-w-0">
          <img
            src={hero}
            alt=""
            className="mx-auto w-full max-w-md object-contain"
          />
          {caption ? (
            <p className="pointer-events-none absolute top-2 right-2 max-w-[9rem] text-right font-[cursive] text-lg leading-tight text-[#1c2f6b] sm:text-xl">
              {caption}
            </p>
          ) : null}
        </div>
      </header>

      {clauses.length > 0 ? (
        <div className="mt-10 grid min-w-0 gap-x-10 gap-y-8 md:grid-cols-2">
          {clauses.map((clause) => {
            const Icon = clause.icon;
            return (
              <section key={clause.title} className="flex min-w-0 gap-3">
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-full"
                  style={{ background: clause.tint, color: clause.ink }}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  {clause.heading ? (
                    <h2 className="text-base font-semibold">{clause.heading}</h2>
                  ) : null}
                  {clause.points.length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-[#3d4a66]">
                      {clause.points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      ) : null}

      {(closeKicker || closeBrand || values.length > 0) && (
        <footer className="relative mt-12 overflow-hidden bg-[#f4f9fc] px-4 pt-8 pb-16">
          <svg
            viewBox="0 0 1440 90"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 50 C 220 90 420 10 720 40 C 980 66 1200 16 1440 42 L1440 90 L0 90 Z"
              fill="#d5ebf7"
            />
            <path
              d="M0 68 C 280 30 560 80 860 48 C 1100 24 1280 58 1440 40 L1440 90 L0 90 Z"
              fill="#c9e4cc"
            />
          </svg>
          {closeKicker ? (
            <p className="relative text-center font-[cursive] text-3xl">{closeKicker}</p>
          ) : null}
          {closeBrand ? (
            <p className="relative mt-1 text-center text-sm font-semibold tracking-[0.28em]">
              {closeBrand}
            </p>
          ) : null}
          {values.length > 0 ? (
            <ul className="relative mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {values.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.key} className="min-w-0 text-center">
                    <Icon className="mx-auto size-6 text-[#1c2f6b]" aria-hidden="true" />
                    <p className="mt-2 text-xs leading-snug text-[#3d4a66]">{item.label}</p>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </footer>
      )}
    </article>
  );
}

// The page-bundle reader parses this source as written. Keep the query and
// the variable map as plain text; a template insertion is not valid GraphQL.
export const query = `
  query Query(
    $eyebrow: String
    $title: String
    $intro: String
    $heroImage: String
    $heroCaption: String
    $section1Title: String
    $section1Body: String
    $section2Title: String
    $section2Body: String
    $section3Title: String
    $section3Body: String
    $section4Title: String
    $section4Body: String
    $section5Title: String
    $section5Body: String
    $section6Title: String
    $section6Body: String
    $section7Title: String
    $section7Body: String
    $section8Title: String
    $section8Body: String
    $section9Title: String
    $section9Body: String
    $section10Title: String
    $section10Body: String
    $closeKicker: String
    $closeBrand: String
    $value1: String
    $value2: String
    $value3: String
    $value4: String
  ) {
    termsPageWidget(
      eyebrow: $eyebrow
      title: $title
      intro: $intro
      heroImage: $heroImage
      heroCaption: $heroCaption
      section1Title: $section1Title
      section1Body: $section1Body
      section2Title: $section2Title
      section2Body: $section2Body
      section3Title: $section3Title
      section3Body: $section3Body
      section4Title: $section4Title
      section4Body: $section4Body
      section5Title: $section5Title
      section5Body: $section5Body
      section6Title: $section6Title
      section6Body: $section6Body
      section7Title: $section7Title
      section7Body: $section7Body
      section8Title: $section8Title
      section8Body: $section8Body
      section9Title: $section9Title
      section9Body: $section9Body
      section10Title: $section10Title
      section10Body: $section10Body
      closeKicker: $closeKicker
      closeBrand: $closeBrand
      value1: $value1
      value2: $value2
      value3: $value3
      value4: $value4
    ) {
      eyebrow
      title
      intro
      heroImage
      heroCaption
      section1Title
      section1Body
      section2Title
      section2Body
      section3Title
      section3Body
      section4Title
      section4Body
      section5Title
      section5Body
      section6Title
      section6Body
      section7Title
      section7Body
      section8Title
      section8Body
      section9Title
      section9Body
      section10Title
      section10Body
      closeKicker
      closeBrand
      value1
      value2
      value3
      value4
    }
  }
`;

export const variables = `{
  eyebrow: getWidgetSetting("eyebrow"),
  title: getWidgetSetting("title"),
  intro: getWidgetSetting("intro"),
  heroImage: getWidgetSetting("heroImage"),
  heroCaption: getWidgetSetting("heroCaption"),
  section1Title: getWidgetSetting("section1Title"),
  section1Body: getWidgetSetting("section1Body"),
  section2Title: getWidgetSetting("section2Title"),
  section2Body: getWidgetSetting("section2Body"),
  section3Title: getWidgetSetting("section3Title"),
  section3Body: getWidgetSetting("section3Body"),
  section4Title: getWidgetSetting("section4Title"),
  section4Body: getWidgetSetting("section4Body"),
  section5Title: getWidgetSetting("section5Title"),
  section5Body: getWidgetSetting("section5Body"),
  section6Title: getWidgetSetting("section6Title"),
  section6Body: getWidgetSetting("section6Body"),
  section7Title: getWidgetSetting("section7Title"),
  section7Body: getWidgetSetting("section7Body"),
  section8Title: getWidgetSetting("section8Title"),
  section8Body: getWidgetSetting("section8Body"),
  section9Title: getWidgetSetting("section9Title"),
  section9Body: getWidgetSetting("section9Body"),
  section10Title: getWidgetSetting("section10Title"),
  section10Body: getWidgetSetting("section10Body"),
  closeKicker: getWidgetSetting("closeKicker"),
  closeBrand: getWidgetSetting("closeBrand"),
  value1: getWidgetSetting("value1"),
  value2: getWidgetSetting("value2"),
  value3: getWidgetSetting("value3"),
  value4: getWidgetSetting("value4")
}`;
