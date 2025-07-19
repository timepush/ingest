// redisClient.js
// Improved Redis client with exponential backoff reconnect, TCP keep-alive, and fast-path sync
import { createClient } from "redis";
import "dotenv/config";

let client = null;
let isReady = false;
let connectPromise = null;

/**
 * Returns a connected Redis client, reusing a single instance.
 * Implements fast-path sync return when already connected,
 * and exponential-backoff reconnect strategy on failures.
 */
export function getRedisClient() {
  // Fast-path: already connected
  if (client && isReady) {
    return client;
  }

  // If a connection is in progress, return its promise
  if (connectPromise) {
    return connectPromise;
  }

  // Otherwise, initiate a new connection
  connectPromise = (async () => {
    client = createClient({
      socket: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        // OS-level TCP keep-alive
        keepAlive: true,
        // Exponential backoff for reconnect attempts
        reconnectStrategy: (retries) => {
          // Wait 50ms, 100ms, 150ms, ... up to max 500ms
          const delay = Math.min(retries * 50, 500);
          console.warn(`Redis reconnect attempt #${retries} in ${delay}ms`);
          return delay;
        },
      },
    });

    client.on("error", (err) => {
      console.error("Redis client error:", err);
      isReady = false;
    });
    client.on("ready", () => {
      console.log("Redis client ready");
      isReady = true;
    });

    try {
      await client.connect();
      isReady = true;
      connectPromise = null; // clear for future reconnects
      return client;
    } catch (err) {
      isReady = false;
      connectPromise = null;
      console.error("Redis connection failed:", err);
      throw err;
    }
  })();

  return connectPromise;
}

/**
 * Gracefully close the Redis client if connected
 */
export async function closeRedisClient() {
  if (client && isReady) {
    console.log("Closing Redis client…");
    try {
      await client.quit();
    } catch (err) {
      console.error("Error closing Redis client:", err);
    }
    client = null;
    isReady = false;
  }
}
