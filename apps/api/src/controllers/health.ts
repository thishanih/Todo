import type { Request, Response } from 'express';
import { getHealthStatus } from '../services/health.js';

export function getHealth(_request: Request, response: Response): void {
  response.json({
    success: true,
    data: getHealthStatus(),
  });
}
