import { describe, expect, it } from '@jest/globals';
import {
  HOW_TO_ORDER_LABEL,
  HOW_TO_ORDER_PATH,
  HOW_TO_ORDER_STEPS,
  howToOrderImage,
  howToOrderSteps,
  insertHowToOrderMenu
} from '../../services/howToOrder.js';

describe('how to order steps', () => {
  it('lists the six ordering steps and their small images', () => {
    expect(HOW_TO_ORDER_STEPS.map((step) => step.id)).toEqual([
      'fabric',
      'design',
      'place',
      'scale',
      'quantity',
      'checkout'
    ]);
    expect(HOW_TO_ORDER_STEPS.map((step) => step.image)).toEqual([
      '/how-to-order/step-1.webp',
      '/how-to-order/step-2.webp',
      '/how-to-order/step-3.webp',
      '/how-to-order/step-4.webp',
      '/how-to-order/step-5.webp',
      '/how-to-order/step-6.webp'
    ]);
    expect(HOW_TO_ORDER_STEPS.every((step) => step.title.trim() && step.text.trim())).toBe(
      true
    );
  });

  it('drops a step with a blank title or a blank explanation', () => {
    const steps = howToOrderSteps([
      ...HOW_TO_ORDER_STEPS,
      {
        id: 'blank',
        title: '   ',
        text: 'Still here',
        image: '/how-to-order/step-1.webp',
        alt: ''
      },
      {
        id: 'empty',
        title: 'Named',
        text: '',
        image: '/how-to-order/step-1.webp',
        alt: ''
      }
    ]);
    expect(steps.map((step) => step.id)).toEqual(HOW_TO_ORDER_STEPS.map((step) => step.id));
    expect(howToOrderSteps([])).toEqual([]);
  });

  it('accepts only the six shipped image paths', () => {
    expect(howToOrderImage('/how-to-order/step-1.webp')).toBe('/how-to-order/step-1.webp');
    expect(howToOrderImage('/how-to-order/step-6.webp')).toBe('/how-to-order/step-6.webp');
    expect(howToOrderImage('/how-to-order/step-1.jpg')).toBeNull();
    expect(howToOrderImage('https://example.com/step.webp')).toBeNull();
    expect(howToOrderImage('/assets/catalog/secret.jpg')).toBeNull();
    expect(howToOrderImage(undefined)).toBeNull();
    expect(howToOrderImage('')).toBeNull();
  });
});

describe('how to order menu', () => {
  const existing = [
    { name: 'Fabrics', url: '/fabrics', children: [] },
    { name: 'Designs', url: '/designs', children: [] },
    { name: 'Apply Fabric', url: '/apply-fabric', children: [] },
    { name: 'About Us', url: '/about-us', children: [] }
  ];

  it('places How To order after Apply Fabric', () => {
    const next = insertHowToOrderMenu(existing);
    expect(next?.map((item) => item.name)).toEqual([
      'Fabrics',
      'Designs',
      'Apply Fabric',
      HOW_TO_ORDER_LABEL,
      'About Us'
    ]);
    expect(next?.[3].url).toBe(HOW_TO_ORDER_PATH);
  });

  it('places the link before About Us when Apply Fabric is missing', () => {
    const next = insertHowToOrderMenu([
      { name: 'Fabrics', url: '/fabrics' },
      { name: 'About Us', url: '/about-us' }
    ]);
    expect(next?.map((item) => item.url)).toEqual([
      '/fabrics',
      HOW_TO_ORDER_PATH,
      '/about-us'
    ]);
  });

  it('appends the link when neither anchor is present', () => {
    const next = insertHowToOrderMenu([{ name: 'Blog', url: '/blog', children: [] }]);
    expect(next?.map((item) => item.url)).toEqual(['/blog', HOW_TO_ORDER_PATH]);
    expect(next?.[0].children).toEqual([]);
  });

  it('does not insert a second link, including one nested in a child', () => {
    const once = insertHowToOrderMenu(existing);
    expect(insertHowToOrderMenu(once || [])).toBeNull();
    expect(
      insertHowToOrderMenu([
        { name: 'Shop', url: '/fabrics', children: [{ name: 'Order', url: HOW_TO_ORDER_PATH }] }
      ])
    ).toBeNull();
  });

  it('leaves a menu that is not a list', () => {
    expect(insertHowToOrderMenu(undefined as unknown as [])).toBeNull();
  });
});
