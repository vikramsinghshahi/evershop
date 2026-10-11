import React from 'react';

export default function FabricsLink() {
  return (
    <a href="/fabrics" className="text-sm font-medium hover:underline">
      Fabrics
    </a>
  );
}

export const layout = {
  areaId: 'headerMiddleLeft',
  sortOrder: 10
};
