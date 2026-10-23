import { useAppDispatch } from '@components/common/context/app.js';
import { Input } from '@components/common/ui/Input.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import { Search } from 'lucide-react';
import React from 'react';

/** True for the Fabrics category URL, including a locale prefix. */
export function isFabricsCategoryUrl(url?: string | null): boolean {
  if (!url) {
    return false;
  }
  const path = url.split('?')[0].replace(/\/$/, '');
  return path === '/fabrics' || path.endsWith('/fabrics');
}

/**
 * Rewrite a listing URL for the fabric name search. Uses the existing `name`
 * ILIKE filter. Other params (sort, facets) stay put. Pure, so the param
 * rules are testable without a page.
 */
export function applyFabricSearchToUrl(
  currentUrl: string | URL,
  term: string
): URL {
  const url = new URL(currentUrl);
  url.searchParams.delete('name');
  url.searchParams.delete('name[operation]');
  url.searchParams.delete('name[value]');
  const query = term.trim();
  if (query) {
    url.searchParams.set('name[operation]', 'like');
    url.searchParams.set('name[value]', query);
  }
  url.searchParams.delete('page');
  return url;
}

export function fabricNameQuery(
  filters?: { key: string; operation: string; value: string }[]
): string {
  return (
    filters?.find(
      (filter) => filter.key === 'name' && filter.operation === 'like'
    )?.value || ''
  );
}

export function FabricSearch({ query }: { query: string }) {
  const dispatch = useAppDispatch();
  const [value, setValue] = React.useState(query);

  React.useEffect(() => {
    setValue(query);
  }, [query]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const url = applyFabricSearchToUrl(window.location.href, value);
    url.searchParams.append('ajax', 'true');
    await dispatch.fetchPageData(url);
    url.searchParams.delete('ajax');
    history.pushState(null, '', url);
  };

  return (
    <form className="relative" onSubmit={onSubmit}>
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={_('Search fabric')}
        aria-label={_('Search fabric')}
        className="h-8 w-44 pr-8 text-sm sm:w-52"
      />
      <button
        type="submit"
        aria-label={_('Search')}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
      >
        <Search className="size-4" />
      </button>
    </form>
  );
}
