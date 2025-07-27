import { Kafka, CompressionTypes, logLevel } from "kafkajs";
import env from "@/env";
import logger from "@/lib/logger";

const BUFFER_SIZE = 500;
const FLUSH_INTERVAL = 300; // ms

let buffer = [];
let flushTimer = null;
let producer = null;

/**
 * Initialize the Kafka producer and inject logger
 */
export async function initKafka() {
  if (producer) return;

  const kafka = new Kafka({
    clientId: env.KAFKA_CLIENT_ID,
    brokers: env.KAFKA_BROKER.split(","),
    logLevel: logLevel.ERROR,
    retry: { retries: 0 },
    requestTimeout: 1000,
    connectionTimeout: 1000,
  });

  producer = kafka.producer({ allowAutoTopicCreation: false });
  await producer.connect();
  console.info("✅ Connected to Kafka producer");
}

export function enqueue(data) {
  if (!producer) throw new Error("Kafka producer not initialized. Call initKafka() first.");
  if (Array.isArray(data)) throw new Error("Data must be a single object, not an array");

  buffer.push({ value: JSON.stringify(data) });

  if (buffer.length === 1) {
    flushTimer = setTimeout(flush, FLUSH_INTERVAL);
  }

  if (buffer.length >= BUFFER_SIZE) {
    return flush();
  }
}

export async function flush() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (buffer.length === 0) return;

  const batch = buffer;
  buffer = [];

  await safeSend(batch);
}

export async function shutdown() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  await flush();
  if (producer) {
    await producer.disconnect();
    producer = null;
  }
}

async function safeSend(batch) {
  try {
    await producer.send({
      topic: env.KAFKA_TOPIC,
      messages: batch,
      compression: CompressionTypes.GZIP,
      acks: 1,
    });
    logger.info(`✅ Sent ${batch.length} messages to Kafka topic ${env.KAFKA_TOPIC}`);
  } catch (err) {
    logger.error({ err, batch }, "Kafka batch send failed");
  }
}
