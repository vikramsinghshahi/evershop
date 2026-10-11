import React from 'react';

interface FabricCard {
  name: string;
  sku: string;
  url: string;
  price: string;
  summary?: string | null;
  swatch: string;
}

export default function FabricList({
  fabrics = []
}: {
  fabrics?: FabricCard[] | null;
}) {
  const items = fabrics || [];
  return (
    <div className="py-8">
      <h1 className="text-2xl font-semibold">Fabrics</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Viscose, cotton and rayon, sold by the metre. Open a cloth, set the
        image scale, and that scale is saved on the cart line through checkout.
      </p>
      {items.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">
          No fabrics are available yet.
        </p>
      )}
      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((fabric) => (
          <li key={fabric.sku}>
            <a
              href={fabric.url}
              className="block overflow-hidden rounded-md border border-border"
            >
              <div className="h-36 w-full" style={{ backgroundColor: fabric.swatch }} />
              <div className="p-4">
                <div className="font-medium">{fabric.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {fabric.price} / metre
                </div>
                {fabric.summary && (
                  <p className="mt-2 text-sm text-muted-foreground">{fabric.summary}</p>
                )}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    fabrics {
      name
      sku
      url
      price
      summary
      swatch
    }
  }
`;
