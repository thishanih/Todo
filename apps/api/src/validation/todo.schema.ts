import { z } from 'zod';

export const createTodoSchema = z
  .object({
    title: z
      .string({ error: 'Title is required and must be text.' })
      .trim()
      .min(1, 'Title is required.'),
    description: z
      .string({ error: 'Description must be text.' })
      .trim()
      .optional(),
    done: z.boolean({ error: 'Done must be true or false.' }).optional(),
  })
  .strict();

export const updateTodoSchema = z
  .object({
    title: z
      .string({ error: 'Title must be text.' })
      .trim()
      .min(1, 'Title cannot be empty.')
      .optional(),
    description: z
      .string({ error: 'Description must be text.' })
      .trim()
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
});
