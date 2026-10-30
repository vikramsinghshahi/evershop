import React from 'react';

const SHOP = '/fabrics';
const APPLY = '/apply-fabric';
const CONTACT = '/contact-us';
const BLEED =
  'relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen';

/** Optimized copies of the homepage banners. Masters stay out of the page. */
const SLIDES = [
  {
    src: '/home/banner-1.webp',
    label: 'Your trusted partner in printed and plain fabrics.'
  },
  {
    src: '/home/banner-2.webp',
    label: 'Your design, our precision.'
  },
  {
    src: '/home/banner-3.webp',
    label: 'Your design, our print expertise.'
  },
  {
    src: '/home/banner-4.webp',
    label: 'Your ideas, our digital prints.'
  }
];

const COLLECTIONS = [
  {
    name: 'Cotton',
    note: 'Soft · Breathable · Versatile',
    tone: 'bg-[#f4f1eb]'
  },
  {
    name: 'Polyester',
    note: 'Durable · Lightweight · Vibrant',
    tone: 'bg-[#eef2f5]'
  },
  {
    name: 'Linen',
    note: 'Natural · Elegant · Comfortable',
    tone: 'bg-[#eadec8]'
  },
  {
    name: 'Viscose',
    note: 'Flowy · Soft · Luxurious',
    tone: 'bg-[#f3e7dc]'
  },
  {
    name: 'Printed fabrics',
    note: 'Creative · Custom · Unique',
    image: '/home/printed.webp'
  }
];

const TRUST = [
  {
    title: 'Global shipping',
    text: 'Reach customers worldwide',
    icon: 'globe'
  },
  {
    title: 'Sustainable practices',
    text: 'Better for tomorrow',
    icon: 'leaf'
  },
  {
    title: 'Premium quality',
    text: 'Consistent & reliable',
    icon: 'shield'
  },
  {
    title: 'Dedicated support',
    text: "We're here to help",
    icon: 'support'
  }
];

const WHY = [
  {
    title: 'Wide range of fabrics',
    text: 'From classic solids to vibrant prints'
  },
  {
    title: 'Custom printing solutions',
    text: 'Your designs, our expertise'
  },
  {
    title: 'Global export experience',
    text: 'Trusted by brands worldwide'
  },
  {
    title: 'Competitive pricing',
    text: 'Premium quality, better value'
  }
];

function TrustIcon({ name }: { name: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    className: 'size-7',
    'aria-hidden': true as const
  };
  if (name === 'leaf') {
    return (
      <svg {...common}>
        <path d="M5 19c8 0 14-6 14-14-8 0-14 6-14 14z" />
        <path d="M8 14c2-1 4-3 6-6" />
      </svg>
    );
  }
  if (name === 'shield') {
    return (
      <svg {...common}>
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    );
  }
  if (name === 'support') {
    return (
      <svg {...common}>
        <path d="M4 13a8 8 0 0116 0" />
        <path d="M4 13v4a2 2 0 002 2h1v-6H6a2 2 0 00-2 2zM20 13v4a2 2 0 01-2 2h-1v-6h1a2 2 0 012 2z" />
        <path d="M12 19v1a2 2 0 002 2h2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16M12 4c2.5 2.4 2.5 13.6 0 16M12 4c-2.5 2.4-2.5 13.6 0 16" />
    </svg>
  );
}

function Hero() {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const count = SLIDES.length;
  const go = (next: number) => setIndex((next + count) % count);

  React.useEffect(() => {
    if (
      paused ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [paused, count]);

  return (
    <section
      className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden bg-[#f5f0e9]"
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 100vw counts the scrollbar. Clip the document so the banner can
          reach both edges without a sideways scroll. clip keeps the
          sticky header working; hidden would not. */}
      <style dangerouslySetInnerHTML={{ __html: 'html,body{overflow-x:clip}' }} />
      <div className="relative aspect-[1920/741] w-full">
        {SLIDES.map((item, itemIndex) => (
          <img
            key={item.src}
            src={item.src}
            alt={itemIndex === index ? item.label : ''}
            width={1920}
            height={741}
            decoding="async"
            fetchPriority={itemIndex === 0 ? 'high' : 'low'}
            aria-hidden={itemIndex === index ? undefined : true}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${
              itemIndex === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>
      <button
        type="button"
        className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-2xl text-white"
        aria-label="Previous slide"
        onClick={() => go(index - 1)}
      >
        ‹
      </button>
      <button
        type="button"
        className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-2xl text-white"
        aria-label="Next slide"
        onClick={() => go(index + 1)}
      >
        ›
      </button>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
        {SLIDES.map((item, dot) => (
          <button
            key={item.src}
            type="button"
            aria-label={`Show slide ${dot + 1}`}
            aria-current={dot === index ? 'true' : undefined}
            className={`size-2.5 rounded-full ${
              dot === index ? 'bg-foreground' : 'bg-foreground/35'
            }`}
            onClick={() => go(dot)}
          />
        ))}
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section aria-label="Why shop here" className="border-b border-border">
      <ul className="grid grid-cols-2 gap-6 px-5 py-8 sm:px-8 lg:grid-cols-4 lg:px-14 xl:px-20">
        {TRUST.map((item) => (
          <li key={item.title} className="flex items-center gap-3">
            <span className="text-[#2f6b45]">
              <TrustIcon name={item.icon} />
            </span>
            <span>
              <span className="block text-sm font-semibold">{item.title}</span>
              <span className="block text-xs text-muted-foreground">
                {item.text}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Collections() {
  return (
    <section className="px-5 py-12 sm:px-8 lg:px-14 xl:px-20" aria-labelledby="home-fabrics">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Explore our
          </p>
          <h2 id="home-fabrics" className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            Fabric collections
          </h2>
        </div>
        <a href={SHOP} className="shrink-0 text-sm font-medium">
          View all fabrics →
        </a>
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {COLLECTIONS.map((fabric) => (
          <li key={fabric.name}>
            <a href={SHOP} className="group block">
              {fabric.image ? (
                <img
                  src={fabric.image}
                  alt=""
                  width={720}
                  height={572}
                  decoding="async"
                  className="aspect-[5/4] w-full rounded-md object-cover"
                />
              ) : (
                <span
                  className={`relative block aspect-[5/4] overflow-hidden rounded-md ${fabric.tone}`}
                >
                  <span
                    className="absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(ellipse 46% 34% at 34% 42%, rgba(255,255,255,0.9), transparent 70%), radial-gradient(ellipse 34% 26% at 66% 64%, rgba(80,60,30,0.07), transparent 72%)'
                    }}
                  />
                </span>
              )}
              <span className="mt-3 flex items-start justify-between gap-2">
                <span>
                  <span className="block font-semibold">{fabric.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {fabric.note}
                  </span>
                </span>
                <span className="text-sm text-muted-foreground group-hover:text-foreground" aria-hidden>
                  →
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CustomAndWhy() {
  return (
    <section className="grid gap-4 px-5 pb-4 sm:px-8 lg:grid-cols-2 lg:px-14 xl:px-20">
      <div className="grid overflow-hidden rounded-xl bg-[#f6f1ea] md:grid-cols-2">
        <img
          src="/home/print-panel.webp"
          alt=""
          width={720}
          height={553}
          decoding="async"
          className="h-full min-h-56 w-full object-cover"
        />
        <div className="flex flex-col justify-center px-6 py-8">
          <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
            Custom prints
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Your design, our fabric
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Bring your ideas to life with our custom printing services. Choose
            from a wide range of fabrics and prints, tailored to your brand's
            vision.
          </p>
          <a
            href={APPLY}
            className="mt-6 inline-flex w-fit items-center rounded-full border border-primary px-5 py-2 text-sm font-medium text-primary"
          >
            Get started →
          </a>
        </div>
      </div>
      <div className="rounded-xl bg-[#f7f5f2] px-6 py-8 sm:px-8" aria-labelledby="home-why">
        <h2 id="home-why" className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Why choose Bharat Textile India?
        </h2>
        <ul className="mt-6 space-y-5">
          {WHY.map((item) => (
            <li key={item.title} className="flex gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-[#2f6b45]/40 text-xs text-[#2f6b45]">
                ✓
              </span>
              <span>
                <span className="block font-semibold">{item.title}</span>
                <span className="block text-sm text-muted-foreground">
                  {item.text}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Together() {
  return (
    <section className="grid bg-[#f7f4ef] md:grid-cols-2">
      <div className="flex flex-col justify-center px-5 py-12 sm:px-8 lg:px-14 xl:px-20">
        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Let's create
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Beautiful fabrics together
        </h2>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          At Bharat Textile India, we believe in the power of fabric to tell
          stories. From concept to creation, we partner with you to deliver
          fabrics that inspire.
        </p>
        <a
          href={CONTACT}
          className="mt-6 inline-flex w-fit items-center rounded-full border border-primary px-5 py-2 text-sm font-medium text-primary"
        >
          Contact us →
        </a>
      </div>
      <img
        src="/home/printed.webp"
        alt=""
        width={720}
        height={572}
        decoding="async"
        className="h-full min-h-56 w-full object-cover"
      />
    </section>
  );
}

/**
 * Center of the store homepage. The header, menu, and footer stay on the
 * shared storefront shell. Sections under the slider fill the viewport width.
 */
export default function HomeLanding() {
  return (
    <div className="home-landing">
      <Hero />
      <div className={`${BLEED} bg-white`}>
        <TrustBar />
        <Collections />
        <CustomAndWhy />
        <Together />
      </div>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 5
};
