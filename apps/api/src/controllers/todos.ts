import type { Request, Response } from 'express';
import {
  createTodo,
  deleteTodo,
  listTodos,
  toggleTodoDone,
  updateTodo,
} from '../services/todos.js';

// Get a list of TODOs with optional filters and pagination
export async function getTodos(request: Request, response: Response) {
  const query = request.validatedTodoListQuery;

  if (!query) {
    throw new Error('TODO list query validation middleware was not applied.');
  }

  const { page, limit, search, status } = query;
  const result = await listTodos(page, limit, search, status);

  response.json({
    success: true,
    data: result,
  });
}

// Create a new TODO
export async function postTodo(request: Request, response: Response) {
  const todo = await createTodo(request.body);

  response.status(201).json({
    success: true,
    data: todo,
  });
}

// Update an existing TODO by ID
export async function putTodo(request: Request, response: Response) {
  const todo = await updateTodo(getValidatedTodoId(request), request.body);

  response.json({
    success: true,
    data: todo,
  });
}

// Toggle the 'done' status of a TODO by ID
export async function patchTodoDone(request: Request, response: Response) {
  const todo = await toggleTodoDone(getValidatedTodoId(request));

  response.json({
    success: true,
    data: todo,
  });
}

// Delete a TODO by ID
export async function removeTodo(request: Request, response: Response) {
  await deleteTodo(getValidatedTodoId(request));

  response.json({
    success: true,
    message: 'TODO deleted successfully.',
  });
}

// Get the validated TODO ID from the request
function getValidatedTodoId(request: Request): string {
  const id = request.validatedTodoId;

  if (!id) {
    throw new Error('TODO ID validation middleware was not applied.');
  }

  return id;
}
