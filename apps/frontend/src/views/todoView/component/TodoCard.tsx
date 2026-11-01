import moment from 'moment';
import { Pencil, Trash2 } from 'lucide-react';
import type { Todo } from '@/interfaces/todo.interface';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface TodoCardProps {
  isDeleting: boolean;
  isUpdatingStatus: boolean;
  onDelete: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onToggleStatus: (todo: Todo) => void;
  todo: Todo;
}

export function TodoCard({
  isDeleting,
  isUpdatingStatus,
  onDelete,
  onEdit,
  onToggleStatus,
  todo,
}: TodoCardProps) {
  return (
    <article
      className={`group flex gap-4 rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${
        todo.done ? 'border-border/70 bg-muted/40' : 'border-border'
      }`}
    >
      <Checkbox
        aria-label={`Mark "${todo.title}" ${todo.done ? 'active' : 'complete'}`}
        checked={todo.done}
        disabled={isUpdatingStatus}
        onCheckedChange={() => onToggleStatus(todo)}
        className="mt-1"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              className={`break-words font-semibold leading-6 ${
                todo.done
                  ? 'text-muted-foreground line-through'
                  : 'text-foreground'
              }`}
            >
              {todo.title}
            </h2>
            {todo.description && (
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                {todo.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <Button
              aria-label={`Edit "${todo.title}"`}
              className="size-8"
              disabled={isDeleting || isUpdatingStatus}
              onClick={() => onEdit(todo)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Pencil aria-hidden="true" />
            </Button>
            <Button
              aria-label={`Delete "${todo.title}"`}
              className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={isDeleting || isUpdatingStatus}
              onClick={() => onDelete(todo)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {todo.done ? 'Completed' : 'Added'}{' '}
          {moment(todo.updatedAt || todo.createdAt).fromNow()}
        </p>
      </div>
    </article>
  );
}
