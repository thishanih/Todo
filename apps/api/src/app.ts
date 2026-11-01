import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import { apiRateLimit } from './middleware/rate-limit.js';
import { requireApiKey } from './middleware/require-api-key.js';
import { healthRouter } from './routes/health.js';
import { todosRouter } from './routes/todos.js';

export const app = express();
app.set('trust proxy', env.TRUST_PROXY_HOPS);

const corsOrigin =
  env.CORS_ORIGINS.length === 1 && env.CORS_ORIGINS[0] === '*'
    ? '*'
    : env.CORS_ORIGINS;

app.use(helmet());
app.use(cors({ origin: corsOrigin }));
app.use('/api', apiRateLimit);
app.use(express.json());
app.use('/api', requireApiKey);
app.use('/api/health', healthRouter);
app.use('/api/todos', todosRouter);
app.use(notFoundHandler);
app.use(errorHandler);
