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
  TodoPayload,
} from '@/interfaces/todo.interface';

const TODO_QUERY_KEY = ['todos'] as const;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

export interface SaveTodoVariables {
  todo: Todo | null;
  payload: TodoPayload;
}

export function useTodos(params: TodoListParams) {
  const queryClient = useQueryClient();
  const todosQuery = useQuery({
    queryKey: [...TODO_QUERY_KEY, params],
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

  // Save todo mutation
  const saveTodoMutation = useMutation({
    mutationFn: async ({ todo, payload }: SaveTodoVariables) =>
      todo ? updateTodoApi(todo._id, payload) : createTodoApi(payload),
    onSuccess: async (_, variables) => {
      await invalidateTodos();
      toast.success(variables.todo ? 'Todo updated' : 'Todo created');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  // Update todo status mutation
  const statusMutation = useMutation({
    mutationFn: (todo: Todo) => updateTodoStatusApi(todo._id),
    onSuccess: async () => {
      await invalidateTodos();
      toast.success('Todo status updated');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  // Delete todo mutation
  const deleteMutation = useMutation({
    mutationFn: (todo: Todo) => deleteTodoApi(todo._id),
    onSuccess: async () => {
      await invalidateTodos();
      toast.success('Todo deleted');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return {
    todosQuery,
    saveTodoMutation,
    statusMutation,
    deleteMutation,
  };
}
