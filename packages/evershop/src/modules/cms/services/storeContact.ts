export interface StoreContactInput {
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  provinceName?: string | null;
  postalCode?: string | null;
  countryName?: string | null;
}

export interface StoreContactView {
  phone: string | null;
  email: string | null;
  addressLines: string[];
}

function clean(value?: string | null): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const text = value.trim();
  return text.length > 0 ? text : null;
}

/**
 * Turn store-setting fields into the lines the contact page shows.
 * Blank fields are left out. The province is already a name, never a code.
 */
export function formatStoreContact(input: StoreContactInput): StoreContactView {
  const phone = clean(input.phone);
  const email = clean(input.email);
  const addressLines: string[] = [];
  const address = clean(input.address);
  if (address) {
    addressLines.push(address);
  }
  const place = [clean(input.city), clean(input.provinceName), clean(input.postalCode)]
    .filter((part): part is string => part != null)
    .join(', ');
  if (place) {
    addressLines.push(place);
  }
  const country = clean(input.countryName);
  if (country) {
    addressLines.push(country);
  }
  return { phone, email, addressLines };
}
