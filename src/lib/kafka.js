// kafkaWrapper.js
// A simple function-based singleton for KafkaJS producer with fast-fail on startup

import "dotenv/config";
import { Kafka, logLevel } from "kafkajs";

// Environment-configurable defaults
const { KAFKA_CLIENT_ID = "timepush-ingest-api", KAFKA_BROKER = "localhost:9092", KAFKA_CONN_TIMEOUT = "1000", KAFKA_REQ_TIMEOUT = "3000", KAFKA_RETRIES = "0", KAFKA_DATA_TOPIC, KAFKA_ERROR_TOPIC } = process.env;

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: [KAFKA_BROKER],
  connectionTimeout: Number(KAFKA_CONN_TIMEOUT),
  requestTimeout: Number(KAFKA_REQ_TIMEOUT),
  retry: { retries: Number(KAFKA_RETRIES) },
  logLevel: logLevel.ERROR,
});

const producer = kafka.producer();
let isProducerConnected = false;

export async function connectProducer() {
  if (isProducerConnected) return;
  try {
    await Promise.race([producer.connect(), new Promise((_, reject) => setTimeout(() => reject(new Error("Kafka producer connect timeout")), 1000))]);
    isProducerConnected = true;
  } catch (err) {
    throw new Error("Kafka producer unavailable");
  }
}

async function sendMessage(topic, payload) {
  await connectProducer();
  return producer.send({
    topic,
    messages: [{ value: JSON.stringify(payload) }],
  });
}

export async function sendToData(payload) {
  if (!KAFKA_DATA_TOPIC) throw new Error("KAFKA_DATA_TOPIC is not defined");
  return sendMessage(KAFKA_DATA_TOPIC, payload);
}

export async function sendToError(payload) {
  if (!KAFKA_ERROR_TOPIC) throw new Error("KAFKA_ERROR_TOPIC is not defined");
  return sendMessage(KAFKA_ERROR_TOPIC, payload);
}

export async function closeProducer() {
  if (isProducerConnected) {
    await producer.disconnect();
    isProducerConnected = false;
  }
}
