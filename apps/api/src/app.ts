import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import { requireApiKey } from './middleware/require-api-key.js';
import { healthRouter } from './routes/health.js';

export const app = express();

const corsOrigin =
  env.CORS_ORIGINS.length === 1 && env.CORS_ORIGINS[0] === '*'
    ? '*'
    : env.CORS_ORIGINS;

app.use(helmet());
app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use('/api', requireApiKey);
app.use('/api/health', healthRouter);
app.use(notFoundHandler);
app.use(errorHandler);
