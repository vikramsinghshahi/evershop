import { useAppDispatch } from '@components/common/context/app.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@components/common/ui/Select.js';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import React from 'react';
import {
  applyFabricKindToUrl,
  FABRIC_KINDS,
  normalizeFabricKind,
  type FabricKind
} from '../services/fabricKind.js';

export type FabricKindUrlFix = 'ok' | 'rewrite' | 'clear';

/**
 * What the address bar needs. One exact kind stays. A known kind in the wrong
 * case is rewritten in place. Anything else (unknown, empty, or two kinds) is
 * removed so the list and the control agree.
 */
export function fabricKindUrlFix(currentUrl: string | URL): FabricKindUrlFix {
  const values = new URL(currentUrl).searchParams.getAll('kind');
  if (values.length === 0) {
    return 'ok';
  }
  if (values.length > 1) {
    return 'clear';
  }
  const canonical = normalizeFabricKind(values[0]);
  if (!canonical) {
    return 'clear';
  }
  return values[0] === canonical ? 'ok' : 'rewrite';
}

/** Replace the kind param with its canonical spelling. Page and search stay. */
export function canonicalizeFabricKindParam(currentUrl: string | URL): URL {
  const url = new URL(currentUrl);
  const canonical = normalizeFabricKind(url.searchParams.get('kind'));
  url.searchParams.delete('kind');
  if (canonical) {
    url.searchParams.set('kind', canonical);
  }
  return url;
}

export function FabricKindFilter({ kind }: { kind: FabricKind | null }) {
  const dispatch = useAppDispatch();
  const [applying, setApplying] = React.useState(false);

  React.useEffect(() => {
    const fix = fabricKindUrlFix(window.location.href);
    if (fix === 'ok') {
      return;
    }
    if (fix === 'rewrite') {
      history.replaceState(
        null,
        '',
        canonicalizeFabricKindParam(window.location.href)
      );
      return;
    }
    let cancelled = false;
    const url = applyFabricKindToUrl(window.location.href, null);
    url.searchParams.append('ajax', 'true');
    dispatch.fetchPageData(url).then(() => {
      if (cancelled) {
        return;
      }
      url.searchParams.delete('ajax');
      history.replaceState(null, '', url);
    });
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const onChange = async (value: string) => {
    const next = normalizeFabricKind(value);
    if (next === kind) {
      return;
    }
    setApplying(true);
    try {
      const url = applyFabricKindToUrl(window.location.href, next);
      url.searchParams.append('ajax', 'true');
      await dispatch.fetchPageData(url);
      url.searchParams.delete('ajax');
      history.pushState(null, '', url);
    } finally {
      setApplying(false);
    }
  };

  const label = kind ?? _('All kinds');

  return (
    <Select
      value={kind ?? ''}
      onValueChange={(value) => {
        if (typeof value === 'string') {
          void onChange(value);
        }
      }}
      disabled={applying}
    >
      <SelectTrigger
        aria-label={_('Fabric kind')}
        className="h-8 min-w-36 cursor-pointer gap-2 border-border bg-card px-2.5 text-sm font-medium text-foreground shadow-none data-[size=default]:h-8"
      >
        <span className="truncate text-foreground">{label}</span>
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false} className="min-w-40">
        <SelectItem value="">{_('All kinds')}</SelectItem>
        {FABRIC_KINDS.map((item) => (
          <SelectItem key={item} value={item}>
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
