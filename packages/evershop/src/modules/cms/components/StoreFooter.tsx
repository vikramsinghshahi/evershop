import { BharatMark } from '@components/frontStore/BharatLogo.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';

/**
 * Store footer — brand line, contact details, and titled link columns.
 * Copy and links are widget settings, edited from Admin → Widgets.
 * A link with an empty URL is shown as text, so notes such as
 * "Sold by the metre" do not need a page.
 */

export interface StoreFooterLink {
  id: string;
  label: string;
  url: string | null;
  newTab?: boolean;
  nofollow?: boolean;
  noReferrer?: boolean;
}

export interface StoreFooterColumn {
  id: string;
  title: string;
  links: StoreFooterLink[];
}

export interface StoreFooterProps {
  storeFooterWidget: {
    heading: string;
    tagline: string;
    email: string;
    phone: string;
    whatsapp: string;
    city: string;
    contactTitle: string;
    columns: StoreFooterColumn[];
  };
}

const LINK_CLASS =
  'text-sm opacity-80 transition-opacity hover:opacity-100 hover:underline';
const TEXT_CLASS = 'text-sm opacity-80';

function sameTabRel(link: StoreFooterLink): string | undefined {
  const tokens = [
    link.noReferrer ? 'noreferrer' : null,
    link.nofollow ? 'nofollow' : null
  ].filter(Boolean);
  return tokens.length > 0 ? tokens.join(' ') : undefined;
}

function whatsappHref(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

function telHref(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const dial = trimmed.replace(/[^\d+]/g, '');
  return dial ? `tel:${dial}` : null;
}

function FooterAnchor({ link }: { link: StoreFooterLink }) {
  if (!link.url) {
    return <span className={TEXT_CLASS}>{link.label}</span>;
  }
  if (link.newTab) {
    return (
      <a
        href={link.url}
        target="_blank"
        rel={
          link.nofollow
            ? 'noopener noreferrer nofollow'
            : 'noopener noreferrer'
        }
        className={LINK_CLASS}
      >
        {link.label}
      </a>
    );
  }
  return (
    <a href={link.url} rel={sameTabRel(link)} className={LINK_CLASS}>
      {link.label}
    </a>
  );
}

function Column({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-3">
      {title.trim() ? (
        <div className="text-xs font-semibold uppercase tracking-wider opacity-60">
          {title}
        </div>
      ) : null}
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

export default function StoreFooter({ storeFooterWidget }: StoreFooterProps) {
  const {
    heading = '',
    tagline = '',
    email = '',
    phone = '',
    whatsapp = '',
    city = '',
    contactTitle = '',
    columns = []
  } = storeFooterWidget ?? {};

  const visible = (Array.isArray(columns) ? columns : []).filter(
    (col) =>
      col &&
      ((typeof col.title === 'string' && col.title.trim().length > 0) ||
        (Array.isArray(col.links) &&
          col.links.some((link) => link && link.label)))
  );

  const emailValue = email.trim();
  const phoneValue = phone.trim();
  const whatsappValue = whatsapp.trim();
  const cityValue = city.trim();
  const phoneLink = telHref(phoneValue);
  const whatsappLink = whatsappHref(whatsappValue);
  const hasContact = Boolean(
    emailValue || phoneValue || whatsappValue || cityValue
  );
  const lgCols = Math.min(
    Math.max(1 + visible.length + (hasContact ? 1 : 0), 2),
    6
  );

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html:
            '@media (min-width: 1024px) { .store-footer-grid { grid-template-columns: repeat(var(--store-footer-cols, 4), minmax(0, 1fr)); } }'
        }}
      />
      <div className="page-width">
        <div
          className="store-footer-grid grid grid-cols-2 gap-x-8 gap-y-8"
          style={
            {
              ['--store-footer-cols' as string]: lgCols
            } as React.CSSProperties
          }
        >
          <div className="col-span-2 min-w-0 lg:col-span-1">
            <div className="flex items-center gap-3">
              <BharatMark className="h-11 w-11 shrink-0" />
              <div className="min-w-0 leading-none">
                {heading.trim() ? (
                  <p className="text-sm font-semibold uppercase tracking-[0.16em]">
                    {heading}
                  </p>
                ) : null}
                {tagline.trim() ? (
                  <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.18em] opacity-70">
                    {tagline}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          {visible.map((col) => {
            const links = (col.links ?? []).filter(
              (link) => link && link.label && link.label.trim()
            );
            return (
              <Column key={col.id} title={col.title || ''}>
                {links.map((link) => (
                  <li key={link.id}>
                    <FooterAnchor link={link} />
                  </li>
                ))}
              </Column>
            );
          })}
          {hasContact ? (
            <Column title={contactTitle.trim() || _('Contact')}>
              {emailValue ? (
                <li>
                  <a href={`mailto:${emailValue}`} className={LINK_CLASS}>
                    {emailValue}
                  </a>
                </li>
              ) : null}
              {phoneLink ? (
                <li>
                  <a href={phoneLink} className={LINK_CLASS}>
                    {phoneValue}
                  </a>
                </li>
              ) : null}
              {whatsappLink ? (
                <li>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LINK_CLASS}
                  >
                    {_('WhatsApp')}
                  </a>
                </li>
              ) : null}
              {cityValue ? (
                <li>
                  <span className={TEXT_CLASS}>{cityValue}</span>
                </li>
              ) : null}
            </Column>
          ) : null}
        </div>
      </div>
    </>
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
