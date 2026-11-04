export const TERMS_PATH = '/terms-and-conditions';
export const TERMS_FOOTER_ID = 'lnk-terms';
export const TERMS_HERO = '/terms/hero.webp';

export const TERMS_PAGE_DEFAULTS = {
  eyebrow: 'OUR POLICIES. YOUR TRUST.',
  title: 'Terms & Conditions',
  intro:
    'Please read the following terms and conditions carefully before placing an order or engaging with Bharat Textile.',
  heroImage: TERMS_HERO,
  heroCaption: '',
  section1Title: '1. Orders & Confirmation',
  section1Body:
    'All orders are subject to confirmation from Bharat Textile.\nWe reserve the right to accept or reject any order at our discretion.\nOnce confirmed, order details (quantity, design, fabric, price, delivery date) cannot be changed without prior written approval.',
  section2Title: '2. Pricing & Payment',
  section2Body:
    'Prices are as per the quotation provided and may be subject to change without prior notice.\nPayment terms (advance, partial or full) must be followed as agreed at the time of order.\nDelayed payments may lead to a delay in production or dispatch.',
  section3Title: '3. Production & Delivery',
  section3Body:
    'Production timelines will be shared at the time of order confirmation.\nWe will make every effort to meet the delivery schedule, but Bharat Textile is not liable for delays caused by natural calamities, strikes, transport issues or any unforeseen circumstances.\nDelivery will be made to the agreed location and as per the terms mentioned in the order.',
  section4Title: '4. Fabric & Print Quality',
  section4Body:
    'We ensure the best quality in fabrics and prints as per the agreed specifications.\nMinor variations in color, shade or texture may occur due to fabric characteristics and printing processes. These are considered acceptable industry standards and not defects.\nAny quality concerns must be reported within 3 days of receiving the goods with supporting images.',
  section5Title: '5. Returns & Replacements',
  section5Body:
    'Returns or replacements will only be accepted for manufacturing defects or incorrect items received.\nThe request must be made within 3 days of delivery with proper proof (photos/videos).\nNo returns or replacements will be accepted for wrong size, color preference or change in design after confirmation.',
  section6Title: '6. Liability',
  section6Body:
    'Bharat Textile is not responsible for any indirect, incidental or consequential losses, including loss of profit, business interruption or any other damages.\nOur total liability, in any case, shall not exceed the value of the order.',
  section7Title: '7. Confidentiality',
  section7Body:
    'All designs, samples, pricing and business information shared by either party will be kept confidential and will not be disclosed to any third party without written consent.',
  section8Title: '8. Governing Law',
  section8Body:
    'These terms and conditions shall be governed by and construed in accordance with the laws of India.\nAny disputes shall be subject to the jurisdiction of the courts in Surat, Gujarat.',
  section9Title: '9. Acceptance',
  section9Body:
    'By placing an order or working with Bharat Textile, you agree to these Terms & Conditions in full.',
  section10Title: '10. Amendments',
  section10Body:
    'Bharat Textile reserves the right to modify these terms and conditions at any time without prior notice.',
  closeKicker: 'Thank you for choosing',
  closeBrand: 'BHARAT TEXTILE',
  value1: 'Premium Quality Fabrics',
  value2: 'Creative Custom Prints',
  value3: 'Sustainable Choices',
  value4: 'Long-Term Partnerships'
} as const;

export type TermsPageCopy = {
  [Key in keyof typeof TERMS_PAGE_DEFAULTS]: string;
};
