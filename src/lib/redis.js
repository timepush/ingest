import { createClient } from "redis";
import "dotenv/config";

let client = null;
let isReady = false;

export async function getRedisClient() {
  if (client && isReady) return client;

  client = createClient({
    socket: {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      reconnectStrategy: () => new Error("No reconnect: fail fast on disconnect"),
    },
  });

  client.on("error", () => {
    isReady = false;
  });
  client.on("ready", () => {
    isReady = true;
  });

  try {
    await client.connect();
    isReady = true;
    return client;
  } catch {
    isReady = false;
    throw new Error("Redis connection failed");
  }
}

export async function closeRedisClient() {
  if (client && isReady) {
    console.log("Closing Redis client…");
    await client.quit();
  }
}
