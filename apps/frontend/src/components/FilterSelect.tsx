import type { ChangeEvent } from 'react';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';

export interface FilterSelectOption<T extends string> {
  label: string;
  value: T;
}

interface FilterSelectProps<T extends string> {
  'aria-label': string;
  className?: string;
  onValueChange: (value: T) => void;
  options: readonly FilterSelectOption<T>[];
  value: T;
}

export function FilterSelect<T extends string>({
  'aria-label': ariaLabel,
  className,
  onValueChange,
  options,
  value,
}: FilterSelectProps<T>) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const option = options.find(
      ({ value: optionValue }) => optionValue === event.currentTarget.value,
    );

    if (option) onValueChange(option.value);
  };

  return (
    <NativeSelect
      aria-label={ariaLabel}
      className={className}
      onChange={handleChange}
      value={value}
    >
      {options.map((option) => (
        <NativeSelectOption key={option.value} value={option.value}>
          {option.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}
