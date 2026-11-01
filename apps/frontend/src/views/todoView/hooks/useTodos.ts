import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  createTodoApi,
  deleteTodoApi,
  getTodosApi,
  updateTodoApi,
  updateTodoStatusApi,
} from '@/services/todo.services';
import type {
  Todo,
  TodoListParams,
  TodoListResult,
  TodoPayload,
} from '@/interfaces/todo.interface';

const TODO_QUERY_KEY = ['todos'] as const;

function getTodoListQueryKey(params: TodoListParams) {
  return [...TODO_QUERY_KEY, params] as const;
}

interface TodoListMutationContext {
  queryKey: ReturnType<typeof getTodoListQueryKey>;
  previousData: TodoListResult | undefined;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

function matchesTodoList(todo: Todo, params: TodoListParams): boolean {
  if (params.status !== undefined && todo.done !== params.status) {
    return false;
  }

  const search = params.search?.trim().toLowerCase();
  return (
    !search ||
    todo.title.toLowerCase().includes(search) ||
    todo.description.toLowerCase().includes(search)
  );
}

async function snapshotTodoList(
  queryClient: ReturnType<typeof useQueryClient>,
  params: TodoListParams,
): Promise<TodoListMutationContext> {
  const queryKey = getTodoListQueryKey(params);
  await queryClient.cancelQueries({ queryKey, exact: true });

  return {
    queryKey,
    previousData: queryClient.getQueryData<TodoListResult>(queryKey),
  };
}

function updateOptimisticTodoList(
  queryClient: ReturnType<typeof useQueryClient>,
  context: TodoListMutationContext,
  todos: Todo[],
  totalDocsDelta: number,
): void {
  if (!context.previousData) return;

  queryClient.setQueryData<TodoListResult>(context.queryKey, (currentData) => {
    if (!currentData) return currentData;

    const totalDocs = Math.max(
      0,
      currentData.pagination.totalDocs + totalDocsDelta,
    );
    const totalPages = Math.ceil(totalDocs / currentData.pagination.limit);

    return {
      todos: todos.slice(0, currentData.pagination.limit),
      pagination: {
        ...currentData.pagination,
        totalDocs,
        totalPages,
        hasNextPage: currentData.pagination.page < totalPages,
        hasPrevPage: currentData.pagination.page > 1,
      },
    };
  });
}

export interface SaveTodoVariables {
  todo: Todo | null;
  payload: TodoPayload;
}

export function useTodos(params: TodoListParams) {
  const queryClient = useQueryClient();
  const todosQuery = useQuery({
    queryKey: getTodoListQueryKey(params),
    queryFn: async () => {
      const response = await getTodosApi(params);
      return response.data.data;
    },
    placeholderData: (previousData) => previousData,
    staleTime: 15_000,
  });

  useEffect(() => {
    if (todosQuery.isError) {
      toast.error(getErrorMessage(todosQuery.error), {
        id: 'todo-list-error',
      });
    }
  }, [todosQuery.error, todosQuery.isError]);

  const invalidateTodos = () =>
    queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEY });

  const saveTodoMutation = useMutation({
    mutationFn: async ({ todo, payload }: SaveTodoVariables) =>
      todo ? updateTodoApi(todo._id, payload) : createTodoApi(payload),
    onMutate: async ({ todo, payload }) => {
      const context = await snapshotTodoList(queryClient, params);
      if (!context.previousData) return context;

      const todos = [...context.previousData.todos];
      let totalDocsDelta = 0;

      if (todo) {
        const index = todos.findIndex((item) => item._id === todo._id);
        if (index >= 0) {
          const currentTodo = todos[index];
          const updatedTodo: Todo = {
            ...currentTodo,
            title: payload.title,
            description: payload.description ?? currentTodo.description,
            done: payload.done ?? currentTodo.done,
            updatedAt: new Date().toISOString(),
          };

          if (matchesTodoList(updatedTodo, params)) {
            todos[index] = updatedTodo;
          } else {
            todos.splice(index, 1);
            totalDocsDelta = -1;
          }
        }
      } else {
        const optimisticTodo: Todo = {
          _id: `optimistic-${Date.now()}`,
          title: payload.title,
          description: payload.description ?? '',
          done: payload.done ?? false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (matchesTodoList(optimisticTodo, params)) {
          totalDocsDelta = 1;
          if (params.page === 1) todos.unshift(optimisticTodo);
        }
      }

      updateOptimisticTodoList(queryClient, context, todos, totalDocsDelta);
      return context;
    },
    onSuccess: async (_, variables) => {
      toast.success(variables.todo ? 'Todo updated' : 'Todo created');
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      toast.error(getErrorMessage(error));
    },
    onSettled: invalidateTodos,
  });

  const statusMutation = useMutation({
    mutationFn: (todo: Todo) => updateTodoStatusApi(todo._id),
    onMutate: async (todo) => {
      const context = await snapshotTodoList(queryClient, params);
      if (!context.previousData) return context;

      const todos = [...context.previousData.todos];
      const index = todos.findIndex((item) => item._id === todo._id);
      let totalDocsDelta = 0;

      if (index >= 0) {
        const updatedTodo: Todo = {
          ...todos[index],
          done: !todos[index].done,
          updatedAt: new Date().toISOString(),
        };

        if (matchesTodoList(updatedTodo, params)) {
          todos[index] = updatedTodo;
        } else {
          todos.splice(index, 1);
          totalDocsDelta = -1;
        }
      }

      updateOptimisticTodoList(queryClient, context, todos, totalDocsDelta);
      return context;
    },
    onSuccess: async () => {
      toast.success('Todo status updated');
    },
    onError: (error, _todo, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      toast.error(getErrorMessage(error));
    },
    onSettled: invalidateTodos,
  });

  const deleteMutation = useMutation({
    mutationFn: (todo: Todo) => deleteTodoApi(todo._id),
    onMutate: async (todo) => {
      const context = await snapshotTodoList(queryClient, params);
      if (!context.previousData) return context;

      const todos = context.previousData.todos.filter(
        (item) => item._id !== todo._id,
      );
      const totalDocsDelta =
        todos.length === context.previousData.todos.length ? 0 : -1;

      updateOptimisticTodoList(queryClient, context, todos, totalDocsDelta);
      return context;
    },
    onSuccess: async () => {
      toast.success('Todo deleted');
    },
    onError: (error, _todo, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      toast.error(getErrorMessage(error));
    },
    onSettled: invalidateTodos,
  });

  return {
    todosQuery,
    saveTodoMutation,
    statusMutation,
    deleteMutation,
  };
}
