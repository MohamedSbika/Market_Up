/**
 * MongoDB connection singleton for Next.js App Router.
 * Reuses the connection across hot-reloads in development
 * and across serverless function invocations in production.
 */
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Attach cache to the global object so it persists across HMR in dev
const globalWithMongoose = global as typeof globalThis & {
  __mongoose?: MongooseCache;
};

const cached: MongooseCache = globalWithMongoose.__mongoose ?? {
  conn: null,
  promise: null,
};

globalWithMongoose.__mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined. Add it to your .env.local file.');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Reset promise so a future attempt can retry
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
