import type { AxiosResponse } from 'axios';
import { apiClient } from '@/helpers/apiClient';
import type {
  ApiResponse,
  Todo,
  TodoListParams,
  TodoListResult,
  TodoPayload,
} from '@/interfaces/todo.interface';

export const getTodosApi = async (
  params: TodoListParams,
): Promise<AxiosResponse<ApiResponse<TodoListResult>>> => {
  const res = await apiClient.get<ApiResponse<TodoListResult>>('/todos', {
    params,
  });
  return res;
};

export const createTodoApi = async (
  payload: TodoPayload,
): Promise<AxiosResponse<ApiResponse<Todo>>> => {
  const res = await apiClient.post<ApiResponse<Todo>>('/todos', payload);
  return res;
};

export const updateTodoApi = async (
  id: string,
  payload: TodoPayload,
): Promise<AxiosResponse<ApiResponse<Todo>>> => {
  const res = await apiClient.put<ApiResponse<Todo>>(
    `/todos/${encodeURIComponent(id)}`,
    payload,
  );
  return res;
};

export const updateTodoStatusApi = async (
  id: string,
): Promise<AxiosResponse<ApiResponse<Todo>>> => {
  const res = await apiClient.patch<ApiResponse<Todo>>(
    `/todos/${encodeURIComponent(id)}/done`,
  );
  return res;
};

export const deleteTodoApi = async (
  id: string,
): Promise<AxiosResponse<{ success: boolean; message: string }>> => {
  const res = await apiClient.delete<{ success: boolean; message: string }>(
    `/todos/${encodeURIComponent(id)}`,
  );
  return res;
};
