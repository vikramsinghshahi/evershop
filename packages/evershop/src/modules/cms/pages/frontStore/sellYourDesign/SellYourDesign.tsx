import React from 'react';
import {
  SELL_YOUR_DESIGN_BANNER,
  SELL_YOUR_DESIGN_GUIDES,
  SELL_YOUR_DESIGN_START,
  SELL_YOUR_DESIGN_STEPS,
  SELL_YOUR_DESIGN_TERMS,
  sellYourDesignBanner
} from '../../../services/sellYourDesign.js';

const NAVY = '#1c3d4f';
const MUTED = '#5e6d76';
const ORANGE = '#e36a2e';

function Icon({ d, color }: { d: string; color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path d={d} stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = {
  user: 'M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2 M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M19 8v6 M22 11h-6',
  upload: 'M12 16V4 M7 9l5-5 5 5 M5 20h14',
  cart: 'M6 6h15l-1.5 9h-12z M6 6 5 3H2 M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2 M18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2',
  wallet: 'M4 7h16v12H4z M4 7l2-3h12 M16 13h4',
  file: 'M7 3h7l5 5v13H7z M14 3v5h5',
  image: 'M4 5h16v14H4z M8 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3 M4 16l4.5-4.5 3 3L16 10l4 4',
  gem: 'M12 3l8 6-8 12L4 9z M4 9h16 M8.5 9 12 21 15.5 9',
  copy: 'M8 8h11v13H8z M5 16V3h11',
  palette: 'M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a1 1 0 0 1-1-1 8 8 0 0 1 1-13 M8 9h.01 M8 13h.01 M12 7h.01',
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M5 21a7 7 0 0 1 14 0',
  seal: 'M12 3l2.2 2.2L17 4.5l.7 2.8L21 9l-1.2 2.6L21 15l-2.8.7L17 19.5l-2.8-.7L12 21l-2.2-2.2L7 19.5l-.7-2.8L3 15l1.2-2.6L3 9l2.8-.7L7 4.5l2.8.7z M9 12l2 2 4-4',
  check: 'M8 4h8v16H8z M8 8h8 M10 12h4 M11 16h2',
  cancel: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18 M9 9l6 6 M15 9l-6 6',
  card: 'M3 7h18v10H3z M3 11h18 M7 15h4',
  shield: 'M12 3l8 3v6c0 5-3.4 7.6-8 9-4.6-1.4-8-4-8-9V6z M9 12l2 2 4-4',
  heart: 'M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9'
} as const;

type IconName = keyof typeof ICONS;

function Bubble({
  name,
  color,
  wash
}: {
  name: IconName;
  color: string;
  wash: string;
}) {
  return (
    <span
      className="grid h-14 w-14 shrink-0 place-items-center rounded-full sm:h-16 sm:w-16"
      style={{ backgroundColor: wash }}
    >
      <Icon d={ICONS[name]} color={color} />
    </span>
  );
}

function Banner() {
  const src = sellYourDesignBanner(SELL_YOUR_DESIGN_BANNER);
  const [broken, setBroken] = React.useState(false);
  if (!src || broken) {
    return null;
  }
  return (
    <img
      src={src}
      alt=""
      width={1280}
      height={428}
      className="h-40 w-full object-cover object-[72%_center] sm:h-52 md:h-full md:max-h-80 md:min-h-64"
      onError={() => setBroken(true)}
    />
  );
}

const STEPS: { id: string; icon: IconName; color: string; wash: string }[] = [
  { id: 'register', icon: 'user', color: '#d9783a', wash: '#fde8d8' },
  { id: 'upload', icon: 'upload', color: '#3d8fd4', wash: '#d9eefb' },
  { id: 'select', icon: 'cart', color: '#3e9a62', wash: '#d9f3e4' },
  { id: 'earn', icon: 'wallet', color: '#8b63d4', wash: '#efe4fb' }
];

const GUIDES: { id: string; icon: IconName; color: string; wash: string }[] = [
  { id: 'size', icon: 'file', color: '#4c8dff', wash: '#e7f0ff' },
  { id: 'formats', icon: 'image', color: '#e07a9a', wash: '#fde7ee' },
  { id: 'quality', icon: 'gem', color: '#3aaa78', wash: '#e3f7ee' },
  { id: 'original', icon: 'copy', color: '#8b6ad8', wash: '#efe8fb' },
  { id: 'print', icon: 'palette', color: '#e0a04a', wash: '#fff1dc' }
];

const TERMS: { id: string; icon: IconName; color: string; wash: string }[] = [
  { id: 'eligibility', icon: 'person', color: '#e07a45', wash: '#fde8dc' },
  { id: 'ownership', icon: 'seal', color: '#4c8dff', wash: '#e7f0ff' },
  { id: 'approval', icon: 'check', color: '#3aaa78', wash: '#e3f7ee' },
  { id: 'returns', icon: 'cancel', color: '#8b6ad8', wash: '#efe8fb' },
  { id: 'wallet', icon: 'card', color: '#e0a04a', wash: '#fff1dc' },
  { id: 'shield', icon: 'shield', color: '#e07a8a', wash: '#fde7ee' }
];

export default function SellYourDesign() {
  const steps = SELL_YOUR_DESIGN_STEPS.map((step) => ({
    ...step,
    ...(STEPS.find((mark) => mark.id === step.id) ?? STEPS[0])
  }));
  const guides = SELL_YOUR_DESIGN_GUIDES.map((guide) => ({
    ...guide,
    ...(GUIDES.find((mark) => mark.id === guide.id) ?? GUIDES[0])
  }));
  const terms = SELL_YOUR_DESIGN_TERMS.map((term, index) => ({
    ...term,
    ...(TERMS[index] ?? TERMS[0])
  }));

  return (
    <article className="sell-your-design py-6 text-[#1c3d4f] sm:py-8" style={{ color: NAVY }}>
      <section className="overflow-hidden rounded-2xl border border-[#f0e6dc] bg-white shadow-[0_1px_2px_rgba(28,61,79,0.04)] md:grid md:grid-cols-2">
        <div className="px-5 py-7 sm:px-8 sm:py-10 md:px-10 md:py-12">
          <p className="flex items-center gap-3 text-[11px] font-bold tracking-[0.18em] text-[#e36a2e] uppercase">
            Designer collaboration
            <span aria-hidden className="h-px w-10 bg-[#e36a2e]" />
          </p>
          <h1 className="mt-3 max-w-sm font-serif text-[1.7rem] leading-[1.15] font-medium sm:text-4xl">
            Turn Your Designs Into Real Sales
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed" style={{ color: MUTED }}>
            Share your creativity with our customers. When a customer selects your design, you
            earn 10% commission — automatically credited to your wallet after the parcel is
            delivered.
          </p>
          <a
            href={SELL_YOUR_DESIGN_START}
            className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-[11px] font-bold tracking-[0.08em] text-white uppercase"
            style={{ backgroundColor: ORANGE }}
          >
            Start selling your designs
            <span aria-hidden>→</span>
          </a>
        </div>
        <Banner />
      </section>

      <section className="mt-12 text-center sm:mt-16">
        <h2 className="font-serif text-3xl font-medium sm:text-4xl">How It Works</h2>
        <p className="mt-2 text-[11px] font-semibold tracking-[0.16em] uppercase" style={{ color: MUTED }}>
          Simple steps. Real earnings.
        </p>
        <ol className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-4">
          {steps.map((step, index) => (
            <li key={step.id} className="relative flex flex-col items-center px-2">
              {index < steps.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute top-7 left-[calc(50%+2.2rem)] hidden text-lg text-[#c5ced4] lg:block"
                >
                  →
                </span>
              ) : null}
              <Bubble name={step.icon} color={step.color} wash={step.wash} />
              <h3 className="mt-4 text-xs font-bold tracking-[0.08em] uppercase">{step.title}</h3>
              <p className="mt-2 max-w-[16rem] text-xs leading-relaxed" style={{ color: MUTED }}>
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 flex flex-col items-start gap-5 rounded-2xl bg-[#fff4ec] px-5 py-6 sm:mt-16 sm:flex-row sm:items-center sm:gap-8 sm:px-8 sm:py-7">
        <div className="flex shrink-0 items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-[#f3c7ae] bg-white">
            <Icon d={ICONS.wallet} color={ORANGE} />
          </span>
          <p className="text-2xl leading-none font-bold" style={{ color: ORANGE }}>
            10%
            <span className="mt-1 block text-[11px] tracking-[0.14em]">COMMISSION</span>
          </p>
        </div>
        <span aria-hidden className="hidden h-12 w-px bg-[#f3d7c6] sm:block" />
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-xl font-medium sm:text-2xl">Your creativity is valuable!</h2>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: MUTED }}>
            Earn 10% commission on every successful sale. The amount will be added to your wallet
            after delivery.
          </p>
        </div>
        <span className="hidden text-[#e7b199] lg:block" aria-hidden>
          <Icon d={ICONS.heart} color="#e7a48a" />
        </span>
      </section>

      <section className="mt-12 text-center sm:mt-16">
        <h2 className="font-serif text-3xl font-medium sm:text-4xl">Designer Guidelines</h2>
        <p className="mt-2 text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: MUTED }}>
          Please follow these guidelines for a smooth experience.
        </p>
        <ul className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {guides.map((guide, index) => (
            <li
              key={guide.id}
              className={`flex flex-col items-center px-2 ${
                index < guides.length - 1 ? 'lg:border-r lg:border-[#ece7e1]' : ''
              }`}
            >
              <Bubble name={guide.icon} color={guide.color} wash={guide.wash} />
              <h3 className="mt-4 text-[11px] font-bold tracking-[0.08em] uppercase">{guide.title}</h3>
              <p className="mt-2 max-w-[14rem] text-xs leading-relaxed" style={{ color: MUTED }}>
                {guide.text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-2xl bg-[#f3faf7] px-5 py-8 sm:mt-16 sm:px-8 sm:py-10">
        <header className="text-center">
          <h2 className="font-serif text-3xl font-medium">Terms & Conditions</h2>
          <p className="mt-2 text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: MUTED }}>
            Please read the following terms carefully.
          </p>
        </header>
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-7">
          {terms.map((term) => (
            <li key={term.id} className="flex items-start gap-3 text-left">
              <Bubble name={term.icon} color={term.color} wash={term.wash} />
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{term.title}</h3>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: MUTED }}>
                  {term.text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-10 flex items-center justify-center gap-3 text-[11px] font-bold tracking-[0.18em] text-[#c47a62] uppercase">
        <span aria-hidden className="h-px w-8 bg-[#e7cfc4]" />
        <span aria-hidden className="text-[#e07a5f]">♥</span>
        Let&apos;s grow together
        <span aria-hidden className="h-px w-8 bg-[#e7cfc4]" />
      </footer>
    </article>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};
