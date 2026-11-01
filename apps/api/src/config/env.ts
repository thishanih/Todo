import 'dotenv/config';

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const port = Number(process.env.PORT ?? 3000);
const corsOrigins = (process.env.CORS_ORIGIN ?? '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}

export const env = {
  API_KEY: requireEnvironmentVariable('API_KEY'),
  CORS_ORIGINS: corsOrigins,
  MONGODB_URI: requireEnvironmentVariable('MONGODB_URI'),
  PORT: port,
};
