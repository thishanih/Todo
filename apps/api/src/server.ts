import { app } from './app.js';
import { env } from './config/env.js';
import { closeDatabase, connectToDatabase } from './database/mongo.js';

try {
  await connectToDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(`API server listening on port ${env.PORT}`);
  });

  const shutdown = () => {
    server.close(() => {
      void closeDatabase().catch((error: unknown) => {
        console.error('Failed to close MongoDB connection:', error);
        process.exitCode = 1;
      });
    });
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
} catch (error) {
  console.error('Failed to start API server:', error);
  process.exitCode = 1;
}
