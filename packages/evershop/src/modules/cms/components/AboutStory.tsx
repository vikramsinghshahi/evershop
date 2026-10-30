import React from 'react';
import {
  ABOUT_STORY_DEFAULTS,
  type AboutStoryCopy
} from '../services/aboutStoryDefaults.js';
import { companyPhoto } from '../services/companyImages.js';

const BLEED =
  'relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen';

interface AboutStoryProps {
  aboutStoryWidget: Partial<AboutStoryCopy> | null;
}

function copy(value: string | null | undefined, fallback: string): string {
  return value == null ? fallback : value;
}

function paragraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function lines(value: string): string[] {
  return value
    .split('\n')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function Cta({ href, label }: { href: string; label: string }) {
  if (!label.trim()) {
    return null;
  }
  const className =
    'inline-flex w-fit items-center bg-[#175a43] px-5 py-3 text-[10px] font-bold tracking-[0.08em] text-white uppercase';
  if (!href.trim()) {
    return <span className={className}>{label}</span>;
  }
  return (
    <a href={href} className={className}>
      {label}
    </a>
  );
}

export default function AboutStory({ aboutStoryWidget }: AboutStoryProps) {
  const source = aboutStoryWidget ?? {};
  const field = (key: keyof AboutStoryCopy) =>
    copy(source[key], ABOUT_STORY_DEFAULTS[key]);

  const stats = [
    { value: field('stat1Value'), label: field('stat1Label') },
    { value: field('stat2Value'), label: field('stat2Label') },
    { value: field('stat3Value'), label: field('stat3Label') }
  ].filter((item) => item.value.trim() || item.label.trim());

  const points = [
    { title: field('point1Title'), text: field('point1Text') },
    { title: field('point2Title'), text: field('point2Text') },
    { title: field('point3Title'), text: field('point3Text') }
  ].filter((item) => item.title.trim() || item.text.trim());

  const values = [
    { index: '01', title: field('value1Title'), text: field('value1Text'), kicker: field('value1Kicker') },
    { index: '02', title: field('value2Title'), text: field('value2Text'), kicker: field('value2Kicker') },
    { index: '03', title: field('value3Title'), text: field('value3Text'), kicker: field('value3Kicker') }
  ].filter((item) => item.title.trim() || item.text.trim());

  const journey = paragraphs(field('journeyBody'));
  const sustain = lines(field('sustainItems'));
  const headline = field('headline');
  const lede = field('lede');
  const picture = (key: keyof AboutStoryCopy) =>
    companyPhoto(source[key], ABOUT_STORY_DEFAULTS[key]);

  const statMarks = ['▦', '▤', '◎'];
  const valueMarks = ['◉', '♢', '⚙'];
  const moments = [
    {
      label: field('thenLabel'),
      text: field('thenText'),
      src: picture('thenImage'),
      alt: 'Rolled printed fabrics'
    },
    {
      label: field('nowLabel'),
      text: field('nowText'),
      src: picture('nowImage'),
      alt: 'Printed fabric bolts'
    }
  ].filter((item) => item.text.trim() || item.label.trim());

  return (
    <article className={`${BLEED} bg-white text-[#183c36]`}>
      <style
        dangerouslySetInnerHTML={{
          __html: 'html,body{overflow-x:clip}'
        }}
      />
      <header className="grid min-h-[370px] bg-[#f5f6f0] lg:grid-cols-[42%_58%]">
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:py-12">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#175a43] uppercase">
            About Us
          </p>
          {headline.trim() && (
            <h1 className="mt-2 max-w-xl font-serif text-4xl leading-[1.13] font-medium sm:text-5xl">
              {headline}
            </h1>
          )}
          {lede.trim() && (
            <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-[#485a55]">
              {lede}
            </p>
          )}
          <div className="mt-4">
            <Cta href={field('ctaUrl')} label={field('ctaLabel')} />
          </div>
        </div>
        <div className="relative min-h-[260px] lg:min-h-[370px]">
          <img
            src={picture('heroImage')}
            alt="Digital fabric printer"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute right-0 bottom-3 bg-white px-4 py-2.5 text-center text-[9px] leading-snug font-bold tracking-wide">
            CUSTOM DIGITAL FABRIC PRINTING
            <br />
            QUALITY-FOCUSED PRODUCTION
          </div>
        </div>
      </header>

      {stats.length > 0 && (
        <section className="grid bg-[#f7f8f3] sm:grid-cols-3">
          {stats.map((item, index) => (
            <div
              key={item.label || item.value}
              className="flex items-center justify-center gap-3.5 border-[#cbd4cc] px-3 py-5 sm:border-r sm:last:border-r-0"
            >
              <span className="text-2xl text-[#175a43]" aria-hidden="true">
                {statMarks[index] ?? '◎'}
              </span>
              <div>
                {item.value.trim() && (
                  <p className="font-serif text-2xl leading-none">{item.value}</p>
                )}
                {item.label.trim() && (
                  <p className="mt-1 text-[9px] tracking-[0.12em] text-[#175a43] uppercase">
                    {item.label}
                  </p>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="mx-auto grid max-w-[1200px] items-center gap-8 px-6 py-8 sm:px-8 lg:grid-cols-2 lg:gap-10">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#175a43] uppercase">
            Our journey
          </p>
          {field('journeyTitle').trim() && (
            <h2 className="mt-2 font-serif text-3xl leading-tight font-medium sm:text-4xl">
              {field('journeyTitle')}
            </h2>
          )}
          <div className="mt-4 space-y-3 text-[13px] leading-relaxed text-[#485a55]">
            {journey.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        {moments.length > 0 && (
          <div className="grid grid-cols-2 gap-1">
            {moments.map((moment) => (
              <figure key={moment.alt} className="relative m-0">
                <img
                  src={moment.src}
                  alt={moment.alt}
                  className="h-[220px] w-full object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2.5 pt-8 pb-2.5 text-[9px] tracking-wide text-white uppercase">
                  {moment.label}
                  {moment.text.trim() && (
                    <strong className="mt-0.5 block text-[13px] font-semibold normal-case">
                      {moment.text}
                    </strong>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      <section className="bg-[#f5f6f0] py-8">
        <div className="mx-auto grid max-w-[1200px] items-center gap-8 px-6 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative pr-12">
            <img
              src={picture('printImage')}
              alt="Printed fabric pattern"
              className="h-[260px] w-full object-cover"
            />
            <img
              src={picture('swatchImage')}
              alt="Fabric swatches"
              className="absolute right-0 bottom-3 h-[120px] w-[37%] border-[5px] border-white object-cover"
            />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#175a43] uppercase">
              What we do
            </p>
            {field('workTitle').trim() && (
              <h2 className="mt-2 font-serif text-3xl leading-tight font-medium sm:text-4xl">
                {field('workTitle')}
              </h2>
            )}
            {field('workIntro').trim() && (
              <p className="mt-3 text-[13px] leading-relaxed text-[#485a55]">
                {field('workIntro')}
              </p>
            )}
            {points.length > 0 && (
              <div className="mt-5 grid sm:grid-cols-3">
                {points.map((point) => (
                  <div
                    key={point.title}
                    className="border-[#d1d9d1] px-3 sm:border-r sm:first:pl-0 sm:last:border-r-0"
                  >
                    {point.title.trim() && (
                      <h3 className="text-[13px] leading-snug font-semibold">
                        {point.title}
                      </h3>
                    )}
                    {point.text.trim() && (
                      <p className="mt-1 text-[10px] leading-relaxed text-[#485a55]">
                        {point.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] items-center gap-8 px-6 py-8 sm:px-8 lg:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#175a43] uppercase">
            A thoughtful approach
          </p>
          {field('sustainTitle').trim() && (
            <h2 className="mt-2 font-serif text-3xl leading-tight font-medium sm:text-4xl">
              {field('sustainTitle')}
            </h2>
          )}
          {field('sustainIntro').trim() && (
            <p className="mt-3 text-[13px] leading-relaxed text-[#485a55]">
              {field('sustainIntro')}
            </p>
          )}
          {sustain.length > 0 && (
            <ul className="mt-3 space-y-1">
              {sustain.map((item) => (
                <li key={item} className="text-[11px] text-[#485a55]">
                  <span className="mr-2 font-bold text-[#175a43]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
        <img
          src={picture('materialsImage')}
          alt="Cotton and greenery"
          className="h-[230px] w-full object-cover"
        />
      </section>

      {values.length > 0 && (
        <section className="bg-[#f7f8f3] py-8">
          <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
            {field('valuesTitle').trim() && (
              <h2 className="font-serif text-3xl leading-tight font-medium sm:text-4xl">
                {field('valuesTitle')}
              </h2>
            )}
            <p className="mt-2 max-w-xl text-[13px] text-[#485a55]">
              Our experience shapes how we work, how we print and how we build
              lasting customer relationships.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {values.map((value, index) => (
                <div
                  key={value.index}
                  className="grid grid-cols-[30px_1fr] gap-2.5 sm:border-r sm:border-[#d0d9d0] sm:pr-3 sm:last:border-r-0"
                >
                  <span className="text-2xl text-[#175a43]" aria-hidden="true">
                    {valueMarks[index] ?? '◉'}
                  </span>
                  <div>
                    <p className="text-[9px] font-bold tracking-[0.1em] text-[#175a43] uppercase">
                      {value.kicker.trim()
                        ? `${value.index} / ${value.kicker}`
                        : value.index}
                    </p>
                    {value.title.trim() && (
                      <h3 className="mt-1.5 text-sm font-bold">{value.title}</h3>
                    )}
                    {value.text.trim() && (
                      <p className="mt-1 text-[10px] leading-relaxed text-[#485a55]">
                        {value.text}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(field('closeTitle').trim() || field('closeText').trim()) && (
        <section className="bg-[#183c36] px-6 py-10 text-center text-white sm:py-12">
          <div className="mx-auto max-w-xl">
            {field('closeTitle').trim() && (
              <h2 className="font-serif text-3xl leading-tight font-medium text-white sm:text-4xl">
                {field('closeTitle')}
              </h2>
            )}
            {field('closeText').trim() && (
              <p className="mx-auto mt-3 max-w-lg text-[13px] leading-relaxed text-[#e0e9e2]">
                {field('closeText')}
              </p>
            )}
            <div className="mt-4 flex justify-center">
              <a
                href={field('closeCtaUrl') || '/contact-us'}
                className="inline-flex bg-white px-5 py-3 text-[10px] font-bold tracking-[0.08em] text-[#175a43] uppercase"
              >
                {field('closeCtaLabel')}
              </a>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}

export const query = `
  query Query(
    $headline: String
    $lede: String
    $ctaLabel: String
    $ctaUrl: String
    $stat1Value: String
    $stat1Label: String
    $stat2Value: String
    $stat2Label: String
    $stat3Value: String
    $stat3Label: String
    $thenLabel: String
    $thenText: String
    $nowLabel: String
    $nowText: String
    $journeyTitle: String
    $journeyBody: String
    $workTitle: String
    $workIntro: String
    $point1Title: String
    $point1Text: String
    $point2Title: String
    $point2Text: String
    $point3Title: String
    $point3Text: String
    $sustainTitle: String
    $sustainIntro: String
    $sustainItems: String
    $valuesTitle: String
    $value1Kicker: String
    $value1Title: String
    $value1Text: String
    $value2Kicker: String
    $value2Title: String
    $value2Text: String
    $value3Kicker: String
    $value3Title: String
    $value3Text: String
    $closeTitle: String
    $closeText: String
    $closeCtaLabel: String
    $closeCtaUrl: String
    $heroImage: String
    $thenImage: String
    $nowImage: String
    $printImage: String
    $swatchImage: String
    $materialsImage: String
  ) {
    aboutStoryWidget(
      headline: $headline
      lede: $lede
      ctaLabel: $ctaLabel
      ctaUrl: $ctaUrl
      stat1Value: $stat1Value
      stat1Label: $stat1Label
      stat2Value: $stat2Value
      stat2Label: $stat2Label
      stat3Value: $stat3Value
      stat3Label: $stat3Label
      thenLabel: $thenLabel
      thenText: $thenText
      nowLabel: $nowLabel
      nowText: $nowText
      journeyTitle: $journeyTitle
      journeyBody: $journeyBody
      workTitle: $workTitle
      workIntro: $workIntro
      point1Title: $point1Title
      point1Text: $point1Text
      point2Title: $point2Title
      point2Text: $point2Text
      point3Title: $point3Title
      point3Text: $point3Text
      sustainTitle: $sustainTitle
      sustainIntro: $sustainIntro
      sustainItems: $sustainItems
      valuesTitle: $valuesTitle
      value1Kicker: $value1Kicker
      value1Title: $value1Title
      value1Text: $value1Text
      value2Kicker: $value2Kicker
      value2Title: $value2Title
      value2Text: $value2Text
      value3Kicker: $value3Kicker
      value3Title: $value3Title
      value3Text: $value3Text
      closeTitle: $closeTitle
      closeText: $closeText
      closeCtaLabel: $closeCtaLabel
      closeCtaUrl: $closeCtaUrl
      heroImage: $heroImage
      thenImage: $thenImage
      nowImage: $nowImage
      printImage: $printImage
      swatchImage: $swatchImage
      materialsImage: $materialsImage
    ) {
      headline
      lede
      ctaLabel
      ctaUrl
      stat1Value
      stat1Label
      stat2Value
      stat2Label
      stat3Value
      stat3Label
      thenLabel
      thenText
      nowLabel
      nowText
      journeyTitle
      journeyBody
      workTitle
      workIntro
      point1Title
      point1Text
      point2Title
      point2Text
      point3Title
      point3Text
      sustainTitle
      sustainIntro
      sustainItems
      valuesTitle
      value1Kicker
      value1Title
      value1Text
      value2Kicker
      value2Title
      value2Text
      value3Kicker
      value3Title
      value3Text
      closeTitle
      closeText
      closeCtaLabel
      closeCtaUrl
      heroImage
      thenImage
      nowImage
      printImage
      swatchImage
      materialsImage
    }
  }
`;

export const variables = `{
  headline: getWidgetSetting("headline"),
  lede: getWidgetSetting("lede"),
  ctaLabel: getWidgetSetting("ctaLabel"),
  ctaUrl: getWidgetSetting("ctaUrl"),
  stat1Value: getWidgetSetting("stat1Value"),
  stat1Label: getWidgetSetting("stat1Label"),
  stat2Value: getWidgetSetting("stat2Value"),
  stat2Label: getWidgetSetting("stat2Label"),
  stat3Value: getWidgetSetting("stat3Value"),
  stat3Label: getWidgetSetting("stat3Label"),
  thenLabel: getWidgetSetting("thenLabel"),
  thenText: getWidgetSetting("thenText"),
  nowLabel: getWidgetSetting("nowLabel"),
  nowText: getWidgetSetting("nowText"),
  journeyTitle: getWidgetSetting("journeyTitle"),
  journeyBody: getWidgetSetting("journeyBody"),
  workTitle: getWidgetSetting("workTitle"),
  workIntro: getWidgetSetting("workIntro"),
  point1Title: getWidgetSetting("point1Title"),
  point1Text: getWidgetSetting("point1Text"),
  point2Title: getWidgetSetting("point2Title"),
  point2Text: getWidgetSetting("point2Text"),
  point3Title: getWidgetSetting("point3Title"),
  point3Text: getWidgetSetting("point3Text"),
  sustainTitle: getWidgetSetting("sustainTitle"),
  sustainIntro: getWidgetSetting("sustainIntro"),
  sustainItems: getWidgetSetting("sustainItems"),
  valuesTitle: getWidgetSetting("valuesTitle"),
  value1Kicker: getWidgetSetting("value1Kicker"),
  value1Title: getWidgetSetting("value1Title"),
  value1Text: getWidgetSetting("value1Text"),
  value2Kicker: getWidgetSetting("value2Kicker"),
  value2Title: getWidgetSetting("value2Title"),
  value2Text: getWidgetSetting("value2Text"),
  value3Kicker: getWidgetSetting("value3Kicker"),
  value3Title: getWidgetSetting("value3Title"),
  value3Text: getWidgetSetting("value3Text"),
  closeTitle: getWidgetSetting("closeTitle"),
  closeText: getWidgetSetting("closeText"),
  closeCtaLabel: getWidgetSetting("closeCtaLabel"),
  closeCtaUrl: getWidgetSetting("closeCtaUrl"),
  heroImage: getWidgetSetting("heroImage"),
  thenImage: getWidgetSetting("thenImage"),
  nowImage: getWidgetSetting("nowImage"),
  printImage: getWidgetSetting("printImage"),
  swatchImage: getWidgetSetting("swatchImage"),
  materialsImage: getWidgetSetting("materialsImage")
}`;
