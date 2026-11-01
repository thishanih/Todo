import { Search, SlidersHorizontal } from 'lucide-react';
import { FilterSelect } from '@/components/FilterSelect';
import { Input } from '@/components/ui/input';
import { TodoStatusFilter } from '@/reusable/enums';

const todoStatusOptions = [
  { value: TodoStatusFilter.All, label: 'All todos' },
  { value: TodoStatusFilter.Active, label: 'In progress' },
  { value: TodoStatusFilter.Completed, label: 'Completed' },
] as const;

interface TodoFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TodoStatusFilter) => void;
  search: string;
  status: TodoStatusFilter;
}

export function TodoFilters({
  onSearchChange,
  onStatusChange,
  search,
  status,
}: TodoFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search todos</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          className="h-11 rounded-xl border-border bg-card pl-10 shadow-none"
          maxLength={200}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search your todos..."
          value={search}
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <SlidersHorizontal aria-hidden="true" className="size-4" />
        <span className="sr-only">Filter todos</span>
        <FilterSelect
          aria-label="Filter todos"
          className="h-11 min-w-36 rounded-xl border-border bg-card"
          onValueChange={onStatusChange}
          options={todoStatusOptions}
          value={status}
        />
      </label>
    </div>
  );
}
