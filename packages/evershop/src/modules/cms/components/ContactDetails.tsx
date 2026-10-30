import React from 'react';
import ContactForm from './ContactForm.js';
import { companyPhoto } from '../services/companyImages.js';
import {
  CONTACT_FORM_DEFAULTS,
  CONTACT_PAGE_DEFAULTS,
  type ContactPageCopy
} from '../services/contactPageDefaults.js';

const BLEED =
  'relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen';

interface ContactDetailsProps {
  contactDetailsWidget: (Partial<ContactPageCopy> & {
    phone?: string | null;
    email?: string | null;
    addressLines?: string[] | null;
  }) | null;
}

function copy(value: string | null | undefined, fallback: string): string {
  return value == null ? fallback : value;
}

export default function ContactDetails({
  contactDetailsWidget
}: ContactDetailsProps) {
  const source = contactDetailsWidget ?? {};
  const field = (key: keyof ContactPageCopy) =>
    copy(source[key], CONTACT_PAGE_DEFAULTS[key]);

  const phone = (source.phone ?? '').trim();
  const email = (source.email ?? '').trim();
  const second = field('secondEmail').trim();
  const emails = [email, second].filter(
    (item, index, all) =>
      item.length > 0 &&
      all.findIndex((other) => other.toLowerCase() === item.toLowerCase()) ===
        index
  );
  const addressLines = Array.isArray(source.addressLines)
    ? source.addressLines.filter((line) => line.trim().length > 0)
    : [];
  const highlights = [1, 2, 3, 4]
    .map((index) => ({
      title: field(`highlight${index}Title` as keyof ContactPageCopy),
      text: field(`highlight${index}Text` as keyof ContactPageCopy)
    }))
    .filter((item) => item.title.trim() || item.text.trim());
  const note = field('note');

  return (
    <section className={`${BLEED} bg-white text-[#10243a]`}>
      <style
        dangerouslySetInnerHTML={{
          __html:
            'html,body{overflow-x:clip}.company-contact-form .evershop-contact-form{max-width:none;margin:0;padding:1.4rem 1.5rem 1.6rem;background:#faf8f5;border-radius:9px}'
        }}
      />
      <header className="relative flex min-h-[262px] items-center overflow-hidden bg-[#faf7f2] px-6 py-10 sm:px-[4.2%]">
        <img
          src={companyPhoto(source.heroImage, CONTACT_PAGE_DEFAULTS.heroImage)}
          alt="Folded floral fabrics"
          className="absolute inset-0 h-full w-full object-cover object-right"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(250,248,244,.98) 0%, rgba(250,248,244,.94) 34%, rgba(250,248,244,.2) 62%, rgba(250,248,244,0) 100%)'
          }}
        />
        <div className="relative max-w-lg">
          {field('eyebrow').trim() && (
            <p className="flex items-center gap-4 text-[13px] font-medium tracking-[3px] text-[#dc5b20] uppercase">
              {field('eyebrow')}
              <span className="h-px w-12 bg-[#dc5b20]" />
            </p>
          )}
          {field('headline').trim() && (
            <h1 className="mt-2 font-serif text-5xl leading-none font-normal tracking-tight text-[#101820] sm:text-6xl">
              {field('headline')}
            </h1>
          )}
          {field('intro').trim() && (
            <p className="mt-3.5 max-w-md text-base leading-snug text-[#63778a]">
              {field('intro')}
            </p>
          )}
        </div>
      </header>

      <div className="grid items-stretch gap-6 px-6 py-8 sm:px-[4.2%] lg:grid-cols-[1fr_1.35fr_0.92fr]">
        <div>
          <h2 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl">
            Get in touch
          </h2>
          {note.trim() && (
            <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-[#63778a]">
              {note}
            </p>
          )}
          <div className="mt-6 space-y-6">
            {addressLines.length > 0 && (
              <Detail
                label={field('addressLabel')}
                icon={
                  <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
                }
              >
                {addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </Detail>
            )}
            {emails.length > 0 && (
              <Detail
                label={field('emailLabel')}
                icon={
                  <>
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m4 7 8 6 8-6" />
                  </>
                }
              >
                {emails.map((item) => (
                  <a key={item} href={`mailto:${item}`} className="block hover:text-[#dc5b20]">
                    {item}
                  </a>
                ))}
              </Detail>
            )}
            {phone && (
              <Detail
                label={field('phoneLabel')}
                icon={
                  <path d="M8 3h3l1 4-2 1a12 12 0 0 0 6 6l1-2 4 1v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z" />
                }
              >
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-[#dc5b20]">
                  {phone}
                </a>
              </Detail>
            )}
          </div>
        </div>

        <div className="company-contact-form">
          <ContactForm
            contactFormWidget={{
              title: CONTACT_FORM_DEFAULTS.title,
              subtitle: CONTACT_FORM_DEFAULTS.subtitle,
              submitLabel: CONTACT_FORM_DEFAULTS.submitLabel,
              successMessage: CONTACT_FORM_DEFAULTS.successMessage,
              showPhone: CONTACT_FORM_DEFAULTS.showPhone,
              showSubject: CONTACT_FORM_DEFAULTS.showSubject,
              consentEnabled: CONTACT_FORM_DEFAULTS.consentEnabled,
              consentText: CONTACT_FORM_DEFAULTS.consentText
            }}
          />
        </div>

        <aside className="hidden overflow-hidden rounded-l-lg bg-[#faf8f5] lg:flex lg:items-center">
          <img
            src={companyPhoto(source.sideImage, CONTACT_PAGE_DEFAULTS.sideImage)}
            alt="We look forward to hearing from you"
            className="h-full w-full object-contain"
          />
        </aside>
      </div>

      {highlights.length > 0 && (
        <div className="grid bg-[#faf8f5] px-6 py-7 sm:grid-cols-2 sm:px-[4.2%] lg:grid-cols-4">
          {highlights.map((item, index) => (
            <div
              key={item.title || item.text}
              className="flex gap-4 px-3 py-2 sm:border-[#d9d5cf] lg:border-r lg:last:border-r-0"
            >
              <span className="text-2xl text-[#dc5b20]" aria-hidden="true">
                {['◎', '▢', '⚙', '❧'][index] ?? '◎'}
              </span>
              <div>
                {item.title.trim() && (
                  <h3 className="text-[10px] font-bold tracking-[0.13em] text-[#203247] uppercase">
                    {item.title}
                  </h3>
                )}
                {item.text.trim() && (
                  <p className="mt-1 max-w-[160px] text-xs leading-relaxed text-[#63778a]">
                    {item.text}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Detail({
  label,
  icon,
  children
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[58px_1fr] items-start gap-6">
      <span className="grid size-[58px] place-items-center rounded-full bg-[#fff0e5] text-[#dc5b20]">
        <svg viewBox="0 0 24 24" className="size-7 fill-none stroke-current stroke-[1.8]">
          {icon}
        </svg>
      </span>
      <div>
        <p className="text-xs tracking-[2px] text-[#dc5b20] uppercase">{label}</p>
        <div className="mt-2 text-sm leading-relaxed text-[#29445e]">{children}</div>
      </div>
    </div>
  );
}

export const query = `
  query Query(
    $eyebrow: String
    $headline: String
    $intro: String
    $addressLabel: String
    $emailLabel: String
    $phoneLabel: String
    $secondEmail: String
    $note: String
    $highlight1Title: String
    $highlight1Text: String
    $highlight2Title: String
    $highlight2Text: String
    $highlight3Title: String
    $highlight3Text: String
    $highlight4Title: String
    $highlight4Text: String
    $heroImage: String
    $sideImage: String
  ) {
    contactDetailsWidget(
      eyebrow: $eyebrow
      headline: $headline
      intro: $intro
      addressLabel: $addressLabel
      emailLabel: $emailLabel
      phoneLabel: $phoneLabel
      secondEmail: $secondEmail
      note: $note
      highlight1Title: $highlight1Title
      highlight1Text: $highlight1Text
      highlight2Title: $highlight2Title
      highlight2Text: $highlight2Text
      highlight3Title: $highlight3Title
      highlight3Text: $highlight3Text
      highlight4Title: $highlight4Title
      highlight4Text: $highlight4Text
      heroImage: $heroImage
      sideImage: $sideImage
    ) {
      eyebrow
      headline
      intro
      addressLabel
      emailLabel
      phoneLabel
      secondEmail
      note
      highlight1Title
      highlight1Text
      highlight2Title
      highlight2Text
      highlight3Title
      highlight3Text
      highlight4Title
      highlight4Text
      heroImage
      sideImage
      phone
      email
      addressLines
    }
  }
`;

export const variables = `{
  eyebrow: getWidgetSetting("eyebrow"),
  headline: getWidgetSetting("headline"),
  intro: getWidgetSetting("intro"),
  addressLabel: getWidgetSetting("addressLabel"),
  emailLabel: getWidgetSetting("emailLabel"),
  phoneLabel: getWidgetSetting("phoneLabel"),
  secondEmail: getWidgetSetting("secondEmail"),
  note: getWidgetSetting("note"),
  highlight1Title: getWidgetSetting("highlight1Title"),
  highlight1Text: getWidgetSetting("highlight1Text"),
  highlight2Title: getWidgetSetting("highlight2Title"),
  highlight2Text: getWidgetSetting("highlight2Text"),
  highlight3Title: getWidgetSetting("highlight3Title"),
  highlight3Text: getWidgetSetting("highlight3Text"),
  highlight4Title: getWidgetSetting("highlight4Title"),
  highlight4Text: getWidgetSetting("highlight4Text"),
  heroImage: getWidgetSetting("heroImage"),
  sideImage: getWidgetSetting("sideImage")
}`;
