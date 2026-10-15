import React from 'react';
import { fieldClass, labelClass } from './designerApi.js';

export interface DesignOptions {
  categories: string[];
  colors: string[];
  repeatTypes: string[];
  fileTypes: string[];
  maxFileMb: number;
  minSidePx: number;
}

export interface DesignDraft {
  name: string;
  description: string;
  category: string;
  colors: string[];
  tags: string;
  repeatType: string;
}

export const REPEAT_LABELS: Record<string, string> = {
  tile: 'Straight tile',
  mirror: 'Mirror',
  vertical: 'Half drop',
  brick: 'Brick',
  center: 'Single placement'
};

export function emptyDraft(): DesignDraft {
  return { name: '', description: '', category: '', colors: [], tags: '', repeatType: 'tile' };
}

export function draftPayload(draft: DesignDraft) {
  return {
    name: draft.name,
    description: draft.description,
    category: draft.category,
    colors: draft.colors,
    tags: draft.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    repeatType: draft.repeatType
  };
}

export function DesignFields({
  draft,
  options,
  idPrefix,
  onChange
}: {
  draft: DesignDraft;
  options: DesignOptions;
  idPrefix: string;
  onChange: (draft: DesignDraft) => void;
}) {
  const set = (patch: Partial<DesignDraft>) => onChange({ ...draft, ...patch });
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-name`}>
            Design name
          </label>
          <input
            id={`${idPrefix}-name`}
            className={fieldClass}
            value={draft.name}
            maxLength={80}
            required
            onChange={(event) => set({ name: event.target.value })}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-category`}>
            Category
          </label>
          <select
            id={`${idPrefix}-category`}
            className={fieldClass}
            value={draft.category}
            required
            onChange={(event) => set({ category: event.target.value })}
          >
            <option value="">Choose…</option>
            {options.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <span className={labelClass}>Main colours</span>
        <div className="flex flex-wrap gap-2">
          {options.colors.map((color) => {
            const on = draft.colors.includes(color);
            return (
              <button
                key={color}
                type="button"
                aria-pressed={on}
                className={`rounded-full border px-3 py-1 text-xs ${
                  on ? 'border-foreground bg-foreground text-background' : 'border-border'
                }`}
                onClick={() =>
                  set({
                    colors: on
                      ? draft.colors.filter((value) => value !== color)
                      : [...draft.colors, color]
                  })
                }
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-repeat`}>
            Recommended repeat
          </label>
          <select
            id={`${idPrefix}-repeat`}
            className={fieldClass}
            value={draft.repeatType}
            onChange={(event) => set({ repeatType: event.target.value })}
          >
            {options.repeatTypes.map((repeat) => (
              <option key={repeat} value={repeat}>
                {REPEAT_LABELS[repeat] ?? repeat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor={`${idPrefix}-tags`}>
            Tags (comma separated, up to 10)
          </label>
          <input
            id={`${idPrefix}-tags`}
            className={fieldClass}
            value={draft.tags}
            placeholder="paisley, festive, block print"
            onChange={(event) => set({ tags: event.target.value })}
          />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor={`${idPrefix}-description`}>
          Description (optional)
        </label>
        <textarea
          id={`${idPrefix}-description`}
          className={fieldClass}
          rows={2}
          maxLength={600}
          value={draft.description}
          onChange={(event) => set({ description: event.target.value })}
        />
      </div>
    </div>
  );
}
