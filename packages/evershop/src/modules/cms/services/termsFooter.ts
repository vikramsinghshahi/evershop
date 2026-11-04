import {
  TERMS_FOOTER_ID,
  TERMS_PATH
} from './termsPageDefaults.js';

export interface TermsFooterLink {
  id?: string;
  label?: string;
  url?: string;
}

export interface TermsFooterColumn {
  id?: string;
  title?: string;
  links?: TermsFooterLink[];
}

/**
 * Add the Terms & Conditions footer link when that path is missing.
 * Returns null when a column already points at the page.
 */
export function ensureTermsFooter(
  columns: TermsFooterColumn[]
): TermsFooterColumn[] | null {
  if (!Array.isArray(columns)) {
    return null;
  }
  const hasTerms = columns.some((column) =>
    (column.links ?? []).some((link) => link?.url === TERMS_PATH)
  );
  if (hasTerms) {
    return null;
  }
  const link = {
    id: TERMS_FOOTER_ID,
    label: 'Terms & Conditions',
    url: TERMS_PATH
  };
  if (columns.length === 0) {
    return [{ id: 'col-policies', title: 'Policies', links: [link] }];
  }
  const next = columns.map((column) => ({
    ...column,
    links: Array.isArray(column.links) ? [...column.links] : []
  }));
  const host =
    next.find((column) =>
      column.links.some(
        (item) => item?.url === '/about-us' || item?.url === '/contact-us'
      )
    ) ?? next[next.length - 1];
  host.links.push(link);
  return next;
}
