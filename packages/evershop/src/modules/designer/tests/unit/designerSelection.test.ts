import { designDownload, parseDesignSelection } from '../../../fabric/services/printDesign.js';

const resolved = {
  uuid: '7b0f3c2e-1c4a-4b7e-9a51-3f0a3c1d2e4f',
  sku: 'D-00042',
  name: 'Monsoon Paisley',
  image: '/assets/designer-designs/7b0f3c2e-1c4a-4b7e-9a51-3f0a3c1d2e4f.webp',
  designerName: 'Asha Studio',
  designerSlug: 'asha-studio'
};

describe('designer design on a cart line', () => {
  it('takes name, image and owner from the server lookup, not the browser', () => {
    const parsed = parseDesignSelection(
      {
        source: 'designer',
        designId: resolved.uuid,
        name: 'Something else',
        image: 'https://evil.example/x.png',
        layout: 'tile',
        rotation: 0
      },
      resolved
    );
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.design).toMatchObject({
        source: 'designer',
        designId: resolved.uuid,
        name: 'Monsoon Paisley',
        image: resolved.image,
        designSku: 'D-00042',
        designerName: 'Asha Studio',
        designerSlug: 'asha-studio'
      });
    }
  });

  it('refuses a design that is no longer live', () => {
    const parsed = parseDesignSelection(
      { source: 'designer', designId: resolved.uuid, layout: 'tile', rotation: 0 },
      null
    );
    expect(parsed).toEqual({
      ok: false,
      message: 'That design is no longer available. Choose another design.'
    });
  });

  it('refuses when the posted id differs from the resolved design', () => {
    const parsed = parseDesignSelection(
      {
        source: 'designer',
        designId: '00000000-0000-4000-8000-000000000000',
        layout: 'tile',
        rotation: 0
      },
      resolved
    );
    expect(parsed.ok).toBe(false);
  });

  it('points the admin download at the private original', () => {
    const target = designDownload({
      source: 'designer',
      designId: resolved.uuid,
      name: resolved.name,
      image: resolved.image,
      layout: 'tile',
      rotation: 0
    });
    expect(target).toMatchObject({
      kind: 'file',
      href: `/api/designer/originals/${resolved.uuid}`
    });
  });
});
