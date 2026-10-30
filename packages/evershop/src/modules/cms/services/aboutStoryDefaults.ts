import { COMPANY_IMAGES } from './companyImages.js';

/**
 * Wording and photos for the About page. The same object is stored on the
 * widget, so an admin edit in the page builder replaces any line or photo
 * without a code change. Phone, email, and address are not here — those
 * come from store settings.
 */
export const ABOUT_STORY_DEFAULTS = {
  headline: '32 Years of Textile Expertise. A World of Possibilities.',
  lede: 'From our roots in the traditional textile industry to serving the global market, Bharat Textile India brings together decades of fabric knowledge, custom digital printing and a passion for quality textiles.',
  ctaLabel: "Let's create together",
  ctaUrl: '/contact-us',
  stat1Value: '32+',
  stat1Label: 'Years of experience',
  stat2Value: 'Custom',
  stat2Label: 'Digital fabric printing',
  stat3Value: 'Global',
  stat3Label: 'International vision',
  thenLabel: 'Then',
  thenText: 'Offline textile business',
  nowLabel: 'Now',
  nowText: 'International online platform',
  journeyTitle: 'Rooted in experience. Moving towards the future.',
  journeyBody:
    'For over 32 years, Bharat Textile has been part of the textile industry, building its understanding of fabrics, quality and customer requirements through hands-on experience.\n\nWhat began as an offline textile business is now expanding into the international market through Bharat Textile India. We are bringing our established industry knowledge to a wider audience with modern custom digital fabric printing solutions.',
  workTitle: 'Custom digital fabric printing',
  workIntro:
    'We help designers, independent creators and growing brands bring their artwork to fabric. Our focus is on vibrant colours, fine details and selecting suitable materials for every project.',
  point1Title: 'Your design, our print',
  point1Text: 'Artwork printed on the cloth you choose.',
  point2Title: 'Vibrant colours and sharp details',
  point2Text: 'Colour and detail held across the print.',
  point3Title: 'Quality-focused production',
  point3Text: 'Materials chosen for the job in front of us.',
  sustainTitle: 'Sustainable fabrics',
  sustainIntro:
    'We believe the future of textiles should include thoughtful material choices. We offer fabric options to suit different needs, including selected cotton and other materials based on availability.',
  sustainItems:
    'Selected natural-fibre fabric options\nMaterial choices for different applications\nCustom printing with your own artwork\nQuality-focused fabric selection',
  valuesTitle: 'The values behind every metre.',
  value1Kicker: 'Experience',
  value1Title: 'Knowledge that matters',
  value1Text:
    'Decades of textile experience inform our approach to fabrics and customer requirements.',
  value2Kicker: 'Creativity',
  value2Title: 'Your design, your vision',
  value2Text:
    'We help turn individual artwork and creative ideas into custom printed textiles.',
  value3Kicker: 'Partnership',
  value3Title: 'Built on trust',
  value3Text:
    'We value clear communication, dependable service and long-term relationships.',
  closeTitle: 'Your ideas. Our textile experience.',
  closeText:
    'Whether you are developing a new collection or sourcing custom printed fabric, we would love to hear about your project.',
  closeCtaLabel: 'Talk to our team',
  closeCtaUrl: '/contact-us',
  heroImage: COMPANY_IMAGES.aboutHero,
  thenImage: COMPANY_IMAGES.aboutThen,
  nowImage: COMPANY_IMAGES.aboutNow,
  printImage: COMPANY_IMAGES.aboutPrint,
  swatchImage: COMPANY_IMAGES.aboutSwatch,
  materialsImage: COMPANY_IMAGES.aboutMaterials
};

export type AboutStoryCopy = typeof ABOUT_STORY_DEFAULTS;
