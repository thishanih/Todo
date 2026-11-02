import { Router } from 'express';
import {
  getTodos,
  patchTodoDone,
  postTodo,
  putTodo,
  removeTodo,
} from '../controllers/todos.js';
import { asyncHandler } from '../middleware/async-handler.js';
import {
  validateBody,
  validateTodoId,
  validateTodoListQuery,
} from '../middleware/validate-request.js';
import {
  createTodoSchema,
  updateTodoSchema,
} from '../validation/todo.schema.js';

export const todosRouter = Router();

todosRouter.get('/', validateTodoListQuery, asyncHandler(getTodos));
todosRouter.post('/', validateBody(createTodoSchema), asyncHandler(postTodo));
todosRouter.put(
  '/:id',
  validateTodoId,
  validateBody(updateTodoSchema),
  asyncHandler(putTodo),
);
todosRouter.patch('/:id/done', validateTodoId, asyncHandler(patchTodoDone));
todosRouter.delete('/:id', validateTodoId, asyncHandler(removeTodo));
