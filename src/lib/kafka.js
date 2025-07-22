// kafkaBatcher.js
// In-memory batching wrapper around KafkaJS producer supporting data and error topics with gzip compression
import "dotenv/config";
import { Kafka, CompressionTypes, logLevel } from "kafkajs";

// Load environment-configurable defaults
const { KAFKA_CLIENT_ID = "timepush-ingest-api", KAFKA_BROKER = "localhost:9092", KAFKA_CONN_TIMEOUT = "1000", KAFKA_REQ_TIMEOUT = "1000", KAFKA_RETRIES = "0", KAFKA_DATA_TOPIC, KAFKA_ERROR_TOPIC } = process.env;

if (!KAFKA_DATA_TOPIC || !KAFKA_ERROR_TOPIC) {
  throw new Error("Both KAFKA_DATA_TOPIC and KAFKA_ERROR_TOPIC must be defined in environment");
}

// Initialize Kafka client and producer
const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: [KAFKA_BROKER],
  connectionTimeout: Number(KAFKA_CONN_TIMEOUT),
  requestTimeout: Number(KAFKA_REQ_TIMEOUT),
  retry: { retries: Number(KAFKA_RETRIES) },
  logLevel: logLevel.ERROR,
});

const producer = kafka.producer({ allowAutoTopicCreation: false });
let isProducerConnected = false;

// Batch buffers and controls for data and error topics
const dataBuffer = [];
const errorBuffer = [];
const MAX_BATCH_SIZE = 100; // messages per batch
const MAX_BATCH_TIME_MS = 200; // ms before flush if batch not full

let dataFlushTimer = null;
let errorFlushTimer = null;

// Ensure single producer connection
export async function ensureConnected() {
  if (!isProducerConnected) {
    await producer.connect();
    isProducerConnected = true;
  }
}

// Generic flush helper (fix timer management)
async function flushBatch(topic, buffer, timerName) {
  if (timerName === "data") {
    if (dataFlushTimer) {
      clearTimeout(dataFlushTimer);
      dataFlushTimer = null;
    }
  } else if (timerName === "error") {
    if (errorFlushTimer) {
      clearTimeout(errorFlushTimer);
      errorFlushTimer = null;
    }
  }
  if (buffer.length === 0) return;
  const batch = buffer.splice(0, buffer.length);
  try {
    await producer.send({
      topic,
      compression: CompressionTypes.GZIP,
      messages: batch,
    });
  } catch (err) {
    console.error(`Failed to send Kafka batch to ${topic}:`, err);
  }
}

// Exported: queue a data message
export async function sendToData(payload) {
  await ensureConnected();
  dataBuffer.push({ value: JSON.stringify(payload) });
  if (dataBuffer.length >= MAX_BATCH_SIZE) {
    await flushBatch(KAFKA_DATA_TOPIC, dataBuffer, "data");
  } else if (!dataFlushTimer) {
    dataFlushTimer = setTimeout(() => flushBatch(KAFKA_DATA_TOPIC, dataBuffer, "data"), MAX_BATCH_TIME_MS);
  }
}

// Exported: queue an error message
export async function sendToError(payload) {
  await ensureConnected();
  errorBuffer.push({ value: JSON.stringify(payload) });
  if (errorBuffer.length >= MAX_BATCH_SIZE) {
    await flushBatch(KAFKA_ERROR_TOPIC, errorBuffer, "error");
  } else if (!errorFlushTimer) {
    errorFlushTimer = setTimeout(() => flushBatch(KAFKA_ERROR_TOPIC, errorBuffer, "error"), MAX_BATCH_TIME_MS);
  }
}

// Flush remaining messages and disconnect producer
export async function closeProducer() {
  await flushBatch(KAFKA_DATA_TOPIC, dataBuffer, "data");
  await flushBatch(KAFKA_ERROR_TOPIC, errorBuffer, "error");
  if (isProducerConnected) {
    await producer.disconnect();
    isProducerConnected = false;
  }
}
