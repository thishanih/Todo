import { MongoClient } from 'mongodb';
import { env } from '../config/env.js';

let client: MongoClient | undefined;

export async function connectToDatabase(): Promise<void> {
  const mongoClient = new MongoClient(env.MONGODB_URI, { maxPoolSize: 100 });
  await mongoClient.connect();
  client = mongoClient;

  console.log(
    `Connected to MongoDB database "${mongoClient.db().databaseName}"`,
  );
}

export async function closeDatabase(): Promise<void> {
  if (!client) {
    return;
  }

  await client.close();
  client = undefined;
}
