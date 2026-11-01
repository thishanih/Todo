import { z } from 'zod';
import {
  TODO_DESCRIPTION_MAX_LENGTH,
  TODO_TITLE_MAX_LENGTH,
  TODO_TITLE_MIN_LENGTH,
} from '../shared/todo-limits.js';

export const createTodoSchema = z
  .object({
    title: z
      .string({ error: 'Title is required and must be text.' })
      .trim()
      .min(TODO_TITLE_MIN_LENGTH, 'Title is required.')
      .max(
        TODO_TITLE_MAX_LENGTH,
        `Title cannot exceed ${TODO_TITLE_MAX_LENGTH} characters.`,
      ),
    description: z
      .string({ error: 'Description must be text.' })
      .trim()
      .max(
        TODO_DESCRIPTION_MAX_LENGTH,
        `Description cannot exceed ${TODO_DESCRIPTION_MAX_LENGTH} characters.`,
      )
      .optional(),
    done: z.boolean({ error: 'Done must be true or false.' }).optional(),
  })
  .strict();

export const updateTodoSchema = z
  .object({
    title: z
      .string({ error: 'Title must be text.' })
      .trim()
      .min(TODO_TITLE_MIN_LENGTH, 'Title cannot be empty.')
      .max(
        TODO_TITLE_MAX_LENGTH,
        `Title cannot exceed ${TODO_TITLE_MAX_LENGTH} characters.`,
      )
      .optional(),
    description: z
      .string({ error: 'Description must be text.' })
      .trim()
      .max(
        TODO_DESCRIPTION_MAX_LENGTH,
        `Description cannot exceed ${TODO_DESCRIPTION_MAX_LENGTH} characters.`,
      )
      .optional(),
    done: z.boolean({ error: 'Done must be true or false.' }).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update.',
  });

export const todoIdSchema = z
  .string({ error: 'Invalid TODO ID. Please provide a valid ID.' })
  .regex(/^[0-9a-f]{24}$/i, 'Invalid TODO ID. Please provide a valid ID.');

export const listTodosQuerySchema = z.object({
  page: z.coerce
    .number({ error: 'Page must be a number.' })
    .int('Page must be a whole number.')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z.coerce
    .number({ error: 'Limit must be a number.' })
    .int('Limit must be a whole number.')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
  search: z
    .string()
    .trim()
    .max(200, 'Search cannot exceed 200 characters.')
    .optional(),
  status: z
    .enum(['true', 'false'], { error: 'Status must be true or false.' })
    .transform((value) => value === 'true')
    .optional(),
});
