import { SettingMenuItem } from '@components/admin/SettingMenuItem.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';

interface IndiaShippingMenuProps {
  indiaShippingUrl: string;
}

export default function IndiaShippingMenu({ indiaShippingUrl }: IndiaShippingMenuProps) {
  return (
    <SettingMenuItem
      url={indiaShippingUrl}
      title={_('India rates')}
      description={_('DTDC Lite, Plus, and Prime prices for India')}
    />
  );
}

export const layout = {
  areaId: 'settingPageMenu',
  sortOrder: 17
};

export const query = `
  query Query {
    indiaShippingUrl: url(routeId: "indiaShipping")
  }
`;
