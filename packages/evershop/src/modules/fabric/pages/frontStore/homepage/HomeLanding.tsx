import React from 'react';

const SHOP = '/fabrics';
const DESIGNS = '/designs';

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

const FABRICS = [
  {
    name: 'Cotton Fabric',
    image:
      'https://www.bharattextileindia.com/wp-content/uploads/2026/10/cotton-scaled.jpeg',
    points: [
      '100% pure and lightweight',
      'Breathable and absorbent',
      'Soft, for every season'
    ]
  },
  {
    name: 'Viscose Fabric',
    image:
      'https://www.bharattextileindia.com/wp-content/uploads/2026/10/modal.jpg',
    points: [
      'Silky feel and a soft drape',
      'Light and breathable',
      'A quiet sheen for fashion'
    ]
  },
  {
    name: 'Rayon Fabric',
    image:
      'https://www.bharattextileindia.com/wp-content/uploads/2026/10/viscose.jpg',
    points: [
      'Smooth, and it takes colour well',
      'Cool against the skin',
      'Made for warm-weather clothes'
    ]
  },
  {
    name: 'Tencel Fabric',
    image:
      'https://www.bharattextileindia.com/wp-content/uploads/2026/10/tencel.jpg',
    points: [
      'From wood pulp',
      'Handles moisture well',
      'Smooth against the skin'
    ]
  },
  {
    name: 'Linen Fabric',
    image:
      'https://www.bharattextileindia.com/wp-content/uploads/2026/10/linen.jpg',
    points: [
      'The texture of flax',
      'Open weave, and it lasts',
      'A plain, lasting look'
    ]
  },
  {
    name: 'Sustainable Fabric',
    image:
      'https://www.bharattextileindia.com/wp-content/uploads/2026/10/sustain.jpg',
    points: [
      'A lighter way of making cloth',
      'Less waste in the finish',
      'A durable, even surface'
    ]
  },
  {
    name: 'Organic Fabric',
    image:
      'https://www.bharattextileindia.com/wp-content/uploads/2026/10/organic.jpg',
    points: [
      'Grown without synthetic pesticides',
      'Soft, and kind to skin',
      'A certified organic cloth'
    ]
  },
  {
    name: 'Bamboo Fabric',
    image:
      'https://www.bharattextileindia.com/wp-content/uploads/2026/10/Bamboo.png',
    points: [
      'Naturally resists odour',
      'Stays cool',
      'Soft, from a fast-growing plant'
    ]
  }
];

const REASONS = [
  {
    title: 'Uncompromising quality',
    text: 'From cotton, rayon, and linen to Tencel, bamboo, and organic blends, the base cloth is a fine grade before any print goes on it.'
  },
  {
    title: 'Digital printing',
    text: 'Eco-ink printing keeps the colour strong, the artwork sharp, and the cloth soft after it is finished.'
  },
  {
    title: 'For designers and wholesale',
    text: 'Small first orders, a sample before a run, wholesale pricing, and shipping for both new labels and larger businesses.'
  }
];

interface LiveDesign {
  uuid: string;
  name: string;
  image: string;
}

function picture(src: string, width: number): string {
  if (src.startsWith('/')) {
    return `/images?src=${encodeURIComponent(src)}&w=${width}&q=70`;
  }
  return src;
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

function FabricCards() {
  return (
    <section className="mt-14" aria-labelledby="home-fabrics">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="home-fabrics" className="text-3xl font-semibold tracking-tight">
          Explore our fabrics
        </h2>
        <p className="mt-2 text-muted-foreground">
          Choose your base fabric. We print your design on it.
        </p>
      </div>
      <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FABRICS.map((fabric) => (
          <li
            key={fabric.name}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <img
              src={fabric.image}
              alt=""
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{fabric.name}</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {fabric.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <a
                href={SHOP}
                className="mt-3 inline-block text-sm font-medium text-primary"
              >
                View fabric
              </a>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TrendingDesigns() {
  const [designs, setDesigns] = React.useState<LiveDesign[] | null>(null);
  const scroller = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    fetch('/api/designer/catalog?limit=8&sort=new', {
      signal: controller.signal
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((json: { data?: { items?: LiveDesign[] } } | null) => {
        const items =
          json?.data?.items?.filter((item) => item.image && item.name) ?? [];
        setDesigns(items);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setDesigns([]);
      });
    return () => controller.abort();
  }, []);

  const move = (direction: number) => {
    scroller.current?.scrollBy({ left: direction * 280, behavior: 'smooth' });
  };

  return (
    <section className="mt-16" aria-labelledby="home-designs">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            id="home-designs"
            className="text-3xl font-semibold tracking-tight"
          >
            Our trending designs
          </h2>
          <p className="mt-2 text-muted-foreground">
            Choose a design. We print it with the same care as the cloth.
          </p>
        </div>
        <a href={DESIGNS} className="shrink-0 text-sm font-medium text-primary">
          All designs
        </a>
      </div>
      {designs && designs.length > 0 ? (
        <div className="relative mt-6">
          <div
            ref={scroller}
            className="flex gap-3 overflow-x-auto scroll-smooth pb-2"
          >
            {designs.map((design) => (
              <a
                key={design.uuid}
                href={DESIGNS}
                className="w-56 shrink-0 overflow-hidden rounded-lg border border-border bg-card"
              >
                <img
                  src={picture(design.image, 480)}
                  alt={design.name}
                  className="aspect-[3/2] w-full object-cover"
                />
              </a>
            ))}
          </div>
          {designs.length > 2 && (
            <>
              <button
                type="button"
                className="absolute left-2 top-1/3 hidden size-9 -translate-y-1/2 rounded-full bg-black/40 text-xl text-white sm:block"
                aria-label="Previous designs"
                onClick={() => move(-1)}
              >
                ‹
              </button>
              <button
                type="button"
                className="absolute right-2 top-1/3 hidden size-9 -translate-y-1/2 rounded-full bg-black/40 text-xl text-white sm:block"
                aria-label="Next designs"
                onClick={() => move(1)}
              >
                ›
              </button>
            </>
          )}
        </div>
      ) : designs ? (
        <p className="mt-6 text-sm text-muted-foreground">
          The design library opens from the link above.
        </p>
      ) : null}
    </section>
  );
}

function Why() {
  return (
    <section
      className="mt-16 rounded-lg bg-[#f5f0e9] px-6 py-10"
      aria-labelledby="home-why"
    >
      <h2 id="home-why" className="text-3xl font-semibold tracking-tight">
        Why Bharat Textile stands out
      </h2>
      <p className="mt-3 max-w-3xl text-muted-foreground">
        Bharat Textile prints cloth and supplies the fabric under it. A design
        comes in, and it leaves as finished cloth for brands, designers, and
        makers.
      </p>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {REASONS.map((reason) => (
          <div key={reason.title}>
            <h3 className="font-semibold">{reason.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{reason.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 max-w-3xl">
        <h3 className="font-semibold">What we do</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick a base fabric, send the artwork, and the cloth is printed,
          finished, and sent out as a roll ready to cut.
        </p>
      </div>
    </section>
  );
}

/**
 * Center of the store homepage. The header, menu, and footer stay on the
 * shared storefront shell. The fabric catalog is the Fabrics category page.
 */
export default function HomeLanding() {
  return (
    <div className="home-landing">
      <Hero />
      <section className="mx-auto mt-12 max-w-3xl text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Fabrics made for your vision
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Bharat Textile prints and sources cloth for brands, designers,
          retailers, and studios. The work is the colour, the detail, and a
          finish that stays the same from the sample to the order.
        </p>
      </section>
      <FabricCards />
      <TrendingDesigns />
      <Why />
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 5
};
