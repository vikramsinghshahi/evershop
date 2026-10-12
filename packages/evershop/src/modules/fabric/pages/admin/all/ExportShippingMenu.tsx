import { SettingMenuItem } from '@components/admin/SettingMenuItem.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';

interface ExportShippingMenuProps {
  exportShippingUrl: string;
}

export default function ExportShippingMenu({
  exportShippingUrl
}: ExportShippingMenuProps) {
  return (
    <SettingMenuItem
      url={exportShippingUrl}
      title={_('Export rates')}
      description={_('Zone by country and the weight price card')}
    />
  );
}

export const layout = {
  areaId: 'settingPageMenu',
  sortOrder: 16
};

export const query = `
  query Query {
    exportShippingUrl: url(routeId: "exportShipping")
  }
`;
