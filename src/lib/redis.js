import { createClient } from "redis";
import "dotenv/config";

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});
client.on("error", (err) => console.error("Redis Client Error", err));

export async function getRedis() {
  if (!client.isOpen) {
    try {
      await client.connect();
      console.log("Connected to Redis");
    } catch (e) {
      console.error("Redis connection failed:", e);
      // decide: process.exit(1) or continue without cache
    }
  }
  return client;
}
