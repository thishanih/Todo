import type { Request, RequestHandler, Response } from 'express';

type AsyncController = (request: Request, response: Response) => Promise<void>;

export function asyncHandler(controller: AsyncController): RequestHandler {
  return (request, response, next) => {
    try {
      void controller(request, response).catch(next);
    } catch (error) {
      next(error);
    }
  };
}
