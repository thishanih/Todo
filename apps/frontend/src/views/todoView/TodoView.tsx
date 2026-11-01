import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { TodoCard } from '@/views/todoView/component/TodoCard';
import { TodoDialog } from '@/views/todoView/widgets/TodoDialog';
import { TodoFilters } from '@/views/todoView/widgets/TodoFilters';
import { TodoListSkeleton } from '@/views/todoView/component/TodoListSkeleton';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { PaginationControls } from '@/components/PaginationControls';
import { RefreshErrorAlert } from '@/components/RefreshErrorAlert';
import { TodoEmptyState } from '@/views/todoView/component/TodoEmptyState';
import { TodoLoadError } from '@/views/todoView/component/TodoLoadError';
import { useTodos } from '@/views/todoView/hooks/useTodos';
import { useDebounce } from '@/hooks/useDebounce';
import { TodoStatusFilter } from '@/reusable/enums';
import type {
  Todo,
  TodoListParams,
  TodoPayload,
} from '@/interfaces/todo.interface';
const TODO_PAGE_SIZE = 8;

export default function TodoView() {
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<TodoStatusFilter>(TodoStatusFilter.All);
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);

  // Debounced search input to avoid excessive API calls
  const search = useDebounce(searchInput.trim(), 250);

  const listParams = useMemo<TodoListParams>(
    () => ({
      page,
      limit: TODO_PAGE_SIZE,
      ...(search ? { search } : {}),
      ...(status === TodoStatusFilter.All
        ? {}
        : { status: status === TodoStatusFilter.Completed }),
    }),
    [page, search, status],
  );

  const { todosQuery, saveTodoMutation, statusMutation, deleteMutation } =
    useTodos(listParams);

  useEffect(() => {
    const totalPages = todosQuery.data?.pagination.totalPages;
    if (totalPages !== undefined && page > Math.max(totalPages, 1)) {
      setPage(Math.max(totalPages, 1));
    }
  }, [page, todosQuery.data?.pagination.totalPages]);

  const todos = todosQuery.data?.todos ?? [];
  const pagination = todosQuery.data?.pagination;
  const currentPage = pagination?.page ?? page;
  const totalPages = pagination?.totalPages ?? 0;
  const isInitialLoading = todosQuery.isPending && !todosQuery.data;

  const openCreateDialog = () => {
    setEditingTodo(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo);
    setIsDialogOpen(true);
  };

  const closeTodoDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setEditingTodo(null);
  };

  const submitTodo = (payload: TodoPayload) => {
    saveTodoMutation.mutate(
      { todo: editingTodo, payload },
      {
        onSuccess: () => {
          if (!editingTodo) {
            setSearchInput('');
            setStatus(TodoStatusFilter.All);
            setPage(1);
          }
          setIsDialogOpen(false);
          setEditingTodo(null);
        },
      },
    );
  };

  const deleteTodo = (todo: Todo) => {
    setTodoToDelete(todo);
  };

  const confirmDeleteTodo = () => {
    if (!todoToDelete) return;

    deleteMutation.mutate(todoToDelete, {
      onSuccess: () => setTodoToDelete(null),
    });
  };

  const changeStatus = (nextStatus: TodoStatusFilter) => {
    setStatus(nextStatus);
    setPage(1);
  };

  const changeSearch = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  return (
    <main className="h-dvh w-full overflow-hidden bg-background text-foreground">
      <section className="mx-auto flex h-full min-h-0 max-w-6xl flex-col px-3 py-4 sm:px-8 sm:py-6">
        <div className="mb-4 flex shrink-0 flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <h1 className="text-4xl font-semibold text-primary tracking-tight sm:text-5xl">
              Your todos,
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
              Keep the important things moving. Add a task, make a little
              progress, and feel good about what you finish.
            </p>
          </div>
          <Button
            className="h-11 shrink-0 rounded-xl px-5 shadow-sm"
            onClick={openCreateDialog}
          >
            <Plus aria-hidden="true" />
            New todo
          </Button>
        </div>

        <section
          aria-label="Todo list"
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border/80 bg-muted/40 p-4 shadow-sm sm:p-6"
        >
          <div className="shrink-0 mt-2">
            <TodoFilters
              onSearchChange={changeSearch}
              onStatusChange={changeStatus}
              search={searchInput}
              status={status}
            />
          </div>

          <div
            aria-live="polite"
            className="mt-5 min-h-0 flex-1 overflow-y-auto"
          >
            {isInitialLoading ? (
              <TodoListSkeleton />
            ) : todosQuery.isError && !todosQuery.data ? (
              <TodoLoadError
                error={todosQuery.error}
                isRetrying={todosQuery.isFetching}
                onRetry={() => void todosQuery.refetch()}
              />
            ) : todos.length === 0 ? (
              <TodoEmptyState
                hasFilters={Boolean(search || status !== TodoStatusFilter.All)}
                onClearFilters={() => {
                  changeSearch('');
                  changeStatus(TodoStatusFilter.All);
                }}
                onCreateTodo={openCreateDialog}
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 p-2 sm:grid-cols-2">
                {todos.map((todo) => (
                  <TodoCard
                    isDeleting={
                      deleteMutation.isPending &&
                      deleteMutation.variables?._id === todo._id
                    }
                    isUpdatingStatus={
                      statusMutation.isPending &&
                      statusMutation.variables?._id === todo._id
                    }
                    key={todo._id}
                    onDelete={deleteTodo}
                    onEdit={openEditDialog}
                    onToggleStatus={(selectedTodo) =>
                      statusMutation.mutate(selectedTodo)
                    }
                    todo={todo}
                  />
                ))}
              </div>
            )}
            {todosQuery.isError && todosQuery.data && (
              <RefreshErrorAlert
                isRetrying={todosQuery.isFetching}
                message="Couldn’t refresh the list. Showing the last loaded results."
                onRetry={() => void todosQuery.refetch()}
              />
            )}
          </div>

          {pagination && pagination.totalDocs > 0 && (
            <div className="mt-5 flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Page{' '}
                <span className="font-medium tabular-nums text-foreground">
                  {currentPage}
                </span>{' '}
                of{' '}
                <span className="font-medium tabular-nums text-foreground">
                  {totalPages}
                </span>
                <span aria-hidden="true" className="mx-2 text-border">
                  ·
                </span>
                {pagination.totalDocs}{' '}
                {pagination.totalDocs === 1 ? 'task' : 'tasks'}
              </p>

              <PaginationControls
                className="mx-0 mt-0 w-full justify-center sm:w-auto sm:justify-end"
                currentPage={currentPage}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPrevPage}
                onPageChange={setPage}
                totalPages={totalPages}
              />
            </div>
          )}
        </section>
      </section>

      <TodoDialog
        isOpen={isDialogOpen}
        isSubmitting={saveTodoMutation.isPending}
        onOpenChange={closeTodoDialog}
        onSubmit={submitTodo}
        todo={editingTodo}
      />
      <ConfirmationDialog
        confirmLabel="Delete todo"
        confirmingLabel="Deleting..."
        description={`"${todoToDelete?.title ?? ''}" will be permanently deleted. This action cannot be undone.`}
        isConfirming={deleteMutation.isPending}
        isOpen={todoToDelete !== null}
        onConfirm={confirmDeleteTodo}
        onOpenChange={(open) => {
          if (!open) setTodoToDelete(null);
        }}
        title="Delete this todo?"
      />
    </main>
  );
}
