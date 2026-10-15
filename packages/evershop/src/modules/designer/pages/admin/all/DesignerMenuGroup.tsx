import { NavigationItemGroup } from '@components/admin/NavigationItemGroup.js';
import { ClipboardCheckIcon, PaletteIcon, WalletIcon } from 'lucide-react';
import React from 'react';

interface DesignerMenuGroupProps {
  designerGrid: string;
  designReview: string;
  designerPayouts: string;
}

export default function DesignerMenuGroup({
  designerGrid,
  designReview,
  designerPayouts
}: DesignerMenuGroupProps) {
  return (
    <NavigationItemGroup
      id="designerMenuGroup"
      name="Designers"
      items={[
        { Icon: PaletteIcon, url: designerGrid, title: 'Designers' },
        { Icon: ClipboardCheckIcon, url: designReview, title: 'Design review' },
        { Icon: WalletIcon, url: designerPayouts, title: 'Designer payouts' }
      ]}
    />
  );
}

export const layout = {
  areaId: 'adminMenu',
  sortOrder: 55
};

export const query = `
  query Query {
    designerGrid: url(routeId: "designerGrid")
    designReview: url(routeId: "designReview")
    designerPayouts: url(routeId: "designerPayouts")
  }
`;
