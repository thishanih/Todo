import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import { env } from '../config/env.js';

export const requireApiKey: RequestHandler = (request, response, next) => {
  const suppliedKey = request.header('x-api-key');

  if (!suppliedKey || !matchesApiKey(suppliedKey)) {
    response.status(401).json({
      success: false,
      error: 'Invalid or missing API key',
    });
    return;
  }

  next();
};

function matchesApiKey(suppliedKey: string): boolean {
  const supplied = Buffer.from(suppliedKey);
  const expected = Buffer.from(env.API_KEY);

  return (
    supplied.length === expected.length && timingSafeEqual(supplied, expected)
  );
}
