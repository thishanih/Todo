import type { RequestHandler } from 'express';
import { z } from 'zod';
import {
  listTodosQuerySchema,
  todoIdSchema,
} from '../validation/todo.schema.js';

declare global {
  namespace Express {
    interface Request {
      validatedTodoId?: string;
      validatedTodoListQuery?: z.output<typeof listTodosQuerySchema>;
    }
  }
}

export function validateBody<TSchema extends z.ZodType>(
  schema: TSchema,
): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      next(result.error);
      return;
    }

    request.body = result.data;
    next();
  };
}

export const validateTodoId: RequestHandler = (request, _response, next) => {
  const result = todoIdSchema.safeParse(request.params.id);

  if (!result.success) {
    next(result.error);
    return;
  }

  request.validatedTodoId = result.data;
  next();
};

export const validateTodoListQuery: RequestHandler = (
  request,
  _response,
  next,
) => {
  const result = listTodosQuerySchema.safeParse(request.query);

  if (!result.success) {
    next(result.error);
    return;
  }

  request.validatedTodoListQuery = result.data;
  next();
};
