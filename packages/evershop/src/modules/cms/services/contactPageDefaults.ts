import { COMPANY_IMAGES } from './companyImages.js';

/**
 * Wording and photos for the Contact page. The address, phone, and primary
 * email are read from store settings at request time and are not stored here.
 * `secondEmail` is the extra published address (the store has one email field).
 */
export const CONTACT_PAGE_DEFAULTS = {
  eyebrow: 'Contact us',
  headline: 'Contact us',
  intro:
    'We would love to hear from you. Whether you have a question, need a custom fabric solution, or want to discuss a partnership, our team is here to help.',
  addressLabel: 'Our address',
  emailLabel: 'Email us',
  phoneLabel: 'Call us',
  secondEmail: 'hello@bharattextileindia.com',
  note: 'We are just a message away. Reach out through the details below or send a message.',
  highlight1Title: 'Global reach',
  highlight1Text: 'Connecting with customers worldwide',
  highlight2Title: 'Quality fabrics',
  highlight2Text: 'Premium fabrics for endless possibilities',
  highlight3Title: 'Custom solutions',
  highlight3Text: 'Tailored to your unique needs',
  highlight4Title: 'Long-term partnerships',
  highlight4Text: 'Growing together for a better tomorrow',
  heroImage: COMPANY_IMAGES.contactHero,
  sideImage: COMPANY_IMAGES.contactSide
};

export type ContactPageCopy = typeof CONTACT_PAGE_DEFAULTS;

export const CONTACT_FORM_DEFAULTS = {
  title: 'Send us a message',
  subtitle:
    'Fill out the form below and we will get back to you as soon as possible.',
  submitLabel: 'Send message',
  successMessage: 'Thanks. Your message has been sent.',
  showPhone: true,
  showSubject: true,
  consentEnabled: false,
  consentText: ''
};
