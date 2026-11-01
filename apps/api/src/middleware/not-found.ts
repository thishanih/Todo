import type { RequestHandler } from 'express';
import { StatusCodes as HttpStatusCodes } from 'http-status-codes';
import { HttpError } from '../shared/http-error.js';

export const notFoundHandler: RequestHandler = (request, _response, next) => {
  next(
    new HttpError(
      HttpStatusCodes.NOT_FOUND,
      `Cannot ${request.method} ${request.originalUrl}`,
    ),
  );
};
