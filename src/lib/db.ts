import mongoose from "mongoose";

import { env } from "@/lib/env";

declare global {
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const globalCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

export async function connectToDatabase() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(env.MONGODB_URI, {
      dbName: undefined,
      bufferCommands: false,
    });
  }

  globalCache.conn = await globalCache.promise;
  global.mongooseCache = globalCache;
  return globalCache.conn;
}
