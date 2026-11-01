import mongoose from 'mongoose';
import { env } from '../config/env.js';

export async function connectToDatabase(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, { maxPoolSize: 100 });

  console.log(`Connected to MongoDB database "${mongoose.connection.name}"`);
}

export async function closeDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
}
