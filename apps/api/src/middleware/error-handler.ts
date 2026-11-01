import type { ErrorRequestHandler } from 'express';
import {
  ReasonPhrases,
  StatusCodes as HttpStatusCodes,
} from 'http-status-codes';
import { HttpError } from '../shared/http-error.js';

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  const isHttpError = error instanceof HttpError;
  const statusCode = isHttpError
    ? error.statusCode
    : HttpStatusCodes.INTERNAL_SERVER_ERROR;

  if (!isHttpError) {
    console.error(error);
  }

  response.status(statusCode).json({
    success: false,
    error: {
      statusCode,
      message: isHttpError
        ? error.message
        : ReasonPhrases.INTERNAL_SERVER_ERROR,
    },
  });
};
