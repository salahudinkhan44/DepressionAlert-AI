// MongoDB connection via mongoose — Phase 3.
// Connects using MONGODB_URI; all entities are keyed by user_id so access
// is restricted to the owning user (SRS SEC-5).
import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    console.log(`[db] MongoDB connected: ${mongoose.connection.name}`);
  });
  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] MongoDB disconnected.');
  });

  await mongoose.connect(config.mongodbUri, {
    serverSelectionTimeoutMS: 10000,
  });
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
