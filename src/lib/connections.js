// testConnections.js
import sql from "./db.js";
import { getRedisClient, closeRedisClient } from "../lib/redis.js";
import { ensureConnected as ensureKafkaConnected, closeProducer } from "./kafka.js";

export const testConnections = async () => {
  // Test Postgres connection
  try {
    // Use Bun SQL tagged template to run a simple query
    await sql`SELECT 1`;
    console.log("[Startup] Postgres client ready");
  } catch (err) {
    throw new Error("Postgres unavailable");
  }

  // Test Redis connection
  try {
    const client = await getRedisClient();
    if (!client.isOpen) throw new Error("Redis client is not open after connect");
    console.log("[Startup] Redis client ready");
  } catch (err) {
    throw new Error("Redis unavailable");
  }

  // Test Kafka connection using batching wrapper's ensureConnected
  try {
    await ensureKafkaConnected();
    console.log("[Startup] Kafka producer ready");
  } catch (err) {
    throw new Error("Kafka unavailable");
  }
};

export const closeConnections = async () => {
  // Close Redis
  try {
    await closeRedisClient();
    console.log("[Shutdown] Redis client closed successfully");
  } catch (err) {
    console.error("Error closing Redis client:", err);
  }

  // Close Kafka producer
  try {
    await closeProducer();
    console.log("[Shutdown] Kafka producer closed successfully");
  } catch (err) {
    console.error("Error closing Kafka producer:", err);
  }

  // Close Postgres pool
  try {
    await sql.end();
    console.log("[Shutdown] Postgres client closed successfully");
  } catch (err) {
    console.error("Error closing Postgres client:", err);
  }
};
