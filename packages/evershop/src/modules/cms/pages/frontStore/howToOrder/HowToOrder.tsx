import React from 'react';
import {
  HOW_TO_ORDER_STEPS,
  howToOrderImage,
  howToOrderSteps,
  type HowToOrderStep
} from '../../../services/howToOrder.js';

const MARKS = ['Print or plain', 'Your design', 'Scale 1–100', 'Metres, then checkout'];

function StepFigure({ step, index }: { step: HowToOrderStep; index: number }) {
  const [broken, setBroken] = React.useState(false);
  const src = howToOrderImage(step.image);
  React.useEffect(() => {
    setBroken(false);
  }, [src]);

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f5f6f0] lg:h-44 lg:w-full lg:rounded-xl">
      {src && !broken ? (
        <img
          src={src}
          alt={step.alt || ''}
          className="h-full w-full object-contain"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="px-1 text-center text-[10px] text-[#485a55]">Step {index}</span>
      )}
    </div>
  );
}

function StepLink({ step }: { step: HowToOrderStep }) {
  const label = step.link?.trim() ?? '';
  const href = step.href?.trim() ?? '';
  if (!label || !href.startsWith('/')) {
    return null;
  }
  return (
    <a href={href} className="mt-1 inline-flex text-xs font-semibold text-[#175a43] underline lg:mt-2">
      {label}
    </a>
  );
}

export default function HowToOrder() {
  const steps = howToOrderSteps(HOW_TO_ORDER_STEPS);

  return (
    <article className="how-to-order py-6 text-[#183c36] sm:py-8">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-[10px] font-bold tracking-[0.2em] text-[#175a43] uppercase">
          Simple steps
        </p>
        <h1 className="mt-2 font-serif text-3xl leading-[1.15] font-medium sm:text-4xl lg:text-5xl">
          How to place an order
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#485a55]">
          Pick a cloth, print a design on it or buy it plain, set the metres, and
          check out.
        </p>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-medium sm:mt-6 sm:gap-x-5 sm:text-sm">
          {MARKS.map((mark, index) => (
            <li key={mark} className="flex items-center gap-5">
              {index > 0 ? (
                <span aria-hidden className="hidden h-4 w-px bg-[#e4e7df] sm:block" />
              ) : null}
              <span>{mark}</span>
            </li>
          ))}
        </ul>
      </header>

      {steps.length === 0 ? (
        <p className="mx-auto mt-10 max-w-xl text-center text-sm text-[#485a55]">
          The ordering steps are not available. Start from Fabrics, or write to us
          from Contact us.
        </p>
      ) : (
        <ol className="mt-6 flex flex-col lg:mt-8 lg:grid lg:w-full lg:grid-flow-col lg:auto-cols-fr lg:gap-4">
            {steps.map((step, index) => {
              const number = String(index + 1).padStart(2, '0');
              const last = index === steps.length - 1;
              return (
                <li
                  key={step.id || number}
                  className="relative flex items-stretch gap-3 lg:flex-col lg:items-stretch lg:gap-0"
                >
                  <div className="flex w-8 shrink-0 flex-col items-center lg:mb-3 lg:w-full lg:flex-row lg:justify-center">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#175a43] text-xs font-bold text-white lg:h-10 lg:w-10 lg:text-sm">
                      {number}
                    </span>
                    {last ? null : (
                      <span aria-hidden className="mt-1 w-px flex-1 bg-[#d5e0db] lg:hidden" />
                    )}
                  </div>
                  {last ? null : (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute top-5 left-[calc(100%+0.5rem)] hidden -translate-x-1/2 -translate-y-1/2 text-lg leading-none font-bold text-[#175a43] lg:block"
                    >
                      ›
                    </span>
                  )}
                  <div className="flex min-w-0 flex-1 items-start gap-3 pb-4 lg:flex-col lg:items-stretch lg:gap-0 lg:pb-0">
                    <StepFigure step={step} index={index + 1} />
                    <div className="min-w-0 lg:mt-3">
                      <h2 className="text-sm leading-snug font-semibold">{step.title}</h2>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#485a55] lg:mt-1.5">
                        {step.text}
                      </p>
                      <StepLink step={step} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
      )}

      <aside className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-[#485a55]">
        <p>
          A print needs a design before it can be added to the cart. Fabric only
          does not. Removing a design leaves the cloth you already chose.
        </p>
        <p className="mt-3">
          Cut fabric is not returnable. A question about a cloth can go to{' '}
          <a href="/contact-us" className="font-semibold text-[#175a43] underline">
            Contact us
          </a>
          .
        </p>
        <a
          href="/fabrics"
          className="mt-6 inline-flex items-center bg-[#175a43] px-5 py-3 text-[11px] font-bold tracking-[0.08em] text-white uppercase"
        >
          Start with a fabric
        </a>
      </aside>
    </article>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};
