import { StatusCodes as HttpStatusCodes } from 'http-status-codes';
import { Todo } from '../models/todo.model.js';
import { HttpError } from '../shared/http-error.js';

export async function listTodos(page: number, limit: number) {
  const result = await Todo.aggregatePaginate(
    Todo.aggregate([{ $sort: { createdAt: -1 } }]),
    { page, limit },
  );

  return {
    todos: result.docs,
    pagination: {
      page: result.page,
      limit: result.limit,
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    },
  };
}

export async function createTodo(input: {
  title: string;
  description?: string;
  done?: boolean;
}) {
  return Todo.create(input);
}

export async function updateTodo(
  id: string,
  input: {
    title?: string;
    description?: string;
    done?: boolean;
  },
) {
  const todo = await findTodo(id);
  Object.assign(todo, input);
  return todo.save();
}

export async function toggleTodoDone(id: string) {
  const todo = await findTodo(id);
  todo.done = !todo.done;
  return todo.save();
}

export async function deleteTodo(id: string) {
  const todo = await Todo.findByIdAndDelete(id);

  if (!todo) {
    throw new HttpError(HttpStatusCodes.NOT_FOUND, 'TODO not found.');
  }
}

async function findTodo(id: string) {
  const todo = await Todo.findById(id);

  if (!todo) {
    throw new HttpError(HttpStatusCodes.NOT_FOUND, 'TODO not found.');
  }

  return todo;
}
