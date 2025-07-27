import { createClient } from "redis";
import env from "@/env";
import logger from "@/lib/logger";

let clientPromise;

export async function initRedis() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const { REDIS_HOST, REDIS_PORT } = env;
      if (!REDIS_HOST || !REDIS_PORT) {
        console.error("REDIS_HOST or REDIS_PORT not set - cannot connect to Redis.");
        process.exit(1);
      }

      const client = createClient({
        socket: { host: REDIS_HOST, port: Number(REDIS_PORT) },
      });

      // Fail fast on any Redis error
      client.on("error", (err) => {
        console.error("Redis error - shutting down:", err);
        process.exit(1);
      });

      // Initial connect
      try {
        await client.connect();
        console.info("✅ Connected to Redis");
      } catch (err) {
        console.error("Failed to connect to Redis - shutting down:", err);
        process.exit(1);
      }

      return client;
    })();
  }

  // Wait for connection before proceeding
  await clientPromise;
}

export async function shutdownRedis() {
  const client = await getRedisClient();
  try {
    await client.quit();
    console.info("✅ Redis connection closed");
  } catch (err) {
    console.error("Error closing Redis connection:", err);
    process.exit(1);
  }
}

export const getRedisClient = async () => {
  const client = await clientPromise;

  return new Proxy(client, {
    get(target, prop) {
      const orig = target[prop];
      if (typeof orig !== "function") return orig;

      return async (...args) => {
        const cmd = String(prop).toUpperCase();
        try {
          return await orig.apply(target, args);
        } catch (e) {
          logger.error(`Redis command ${cmd} failed`, e);
          throw e;
        }
      };
    },
  });
};
