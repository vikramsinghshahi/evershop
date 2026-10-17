import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@components/common/ui/Select.js';
import React from 'react';

export interface DesignerSelectOption {
  value: string;
  label: string;
}

/**
 * Storefront select for designer forms and filters. Same control as currency
 * and the designs gallery — not a native <select>.
 */
export function DesignerSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
  className
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DesignerSelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const selected = options.find((option) => option.value === value);
  const shown = selected?.label ?? placeholder ?? label;
  return (
    <Select
      value={selected ? selected.value : null}
      onValueChange={(next) => {
        if (typeof next === 'string' && next !== value) {
          onChange(next);
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        aria-label={label}
        aria-required={required || undefined}
        className={`h-9 w-full min-w-0 cursor-pointer justify-between border-border bg-background ${
          className ?? ''
        }`}
      >
        <span className={`truncate ${selected ? '' : 'text-muted-foreground'}`}>{shown}</span>
      </SelectTrigger>
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        className="z-[1300] min-w-48"
      >
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="cursor-pointer">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
