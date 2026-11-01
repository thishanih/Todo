export interface Todo {
  _id: string;
  title: string;
  description: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoPayload {
  title: string;
  description?: string;
  done?: boolean;
}

export interface TodoListParams {
  page: number;
  limit: number;
  search?: string;
  status?: boolean;
}

export interface TodoPagination {
  page: number;
  limit: number;
  totalDocs: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface TodoListResult {
  todos: Todo[];
  pagination: TodoPagination;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
