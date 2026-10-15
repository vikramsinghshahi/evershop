import React from 'react';

export function StatusTabs<T extends string>({
  tabs,
  active,
  onChange
}: {
  tabs: { id: T; label: string; count: number }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap gap-2" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`rounded-full border px-3 py-1 text-sm ${
            active === tab.id ? 'border-foreground bg-foreground text-background' : 'border-border'
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
}
