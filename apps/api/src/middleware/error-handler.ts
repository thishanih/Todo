import type { ErrorRequestHandler } from 'express';
import {
  ReasonPhrases,
  StatusCodes as HttpStatusCodes,
} from 'http-status-codes';
import mongoose from 'mongoose';
import { z } from 'zod';
import { HttpError } from '../shared/http-error.js';

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  _next,
) => {
  if (error instanceof z.ZodError) {
    response.status(HttpStatusCodes.BAD_REQUEST).json({
      success: false,
      error: {
        statusCode: HttpStatusCodes.BAD_REQUEST,
        message: error.issues[0]?.message ?? 'Please check the provided input.',
        details: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map((validationError) => ({
      field: validationError.path,
      message: validationError.message,
    }));

    response.status(HttpStatusCodes.BAD_REQUEST).json({
      success: false,
      error: {
        statusCode: HttpStatusCodes.BAD_REQUEST,
        message: details[0]?.message ?? 'Please provide valid TODO details.',
        details,
      },
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    response.status(HttpStatusCodes.BAD_REQUEST).json({
      success: false,
      error: {
        statusCode: HttpStatusCodes.BAD_REQUEST,
        message: 'One or more TODO fields have an invalid value.',
      },
    });
    return;
  }

  if (isDuplicateKeyError(error)) {
    response.status(HttpStatusCodes.CONFLICT).json({
      success: false,
      error: {
        statusCode: HttpStatusCodes.CONFLICT,
        message: 'A TODO with these details already exists.',
      },
    });
    return;
  }

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

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}
