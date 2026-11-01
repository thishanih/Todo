import { ListTodo, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TodoEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreateTodo: () => void;
}

export function TodoEmptyState({
  hasFilters,
  onClearFilters,
  onCreateTodo,
}: TodoEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/70 px-6 py-12 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <ListTodo aria-hidden="true" className="size-6" />
      </span>
      <h3 className="mt-4 font-semibold">
        {hasFilters ? 'No todos match these filters' : 'A fresh page'}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {hasFilters
          ? 'Try another search or switch the status filter.'
          : 'Nothing on your list yet. Add a todo and make today yours.'}
      </p>
      {hasFilters ? (
        <Button className="mt-4" onClick={onClearFilters} variant="outline">
          Clear filters
        </Button>
      ) : (
        <Button className="mt-4" onClick={onCreateTodo}>
          <Plus aria-hidden="true" />
          Create your first todo
        </Button>
      )}
    </div>
  );
}
