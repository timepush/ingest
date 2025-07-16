import { Kafka } from "kafkajs";
import "dotenv/config";

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: [process.env.KAFKA_BROKER],
});
let producer = null;

const connectProducer = async () => {
  producer = kafka.producer();
  await producer.connect();
};

const sendToData = async (payload) => {
  if (!producer) throw new Error("Kafka producer not connected");
  await producer.send({
    topic: process.env.KAFKA_DATA_TOPIC,
    messages: [{ value: JSON.stringify([payload]) }],
  });
};

const sendToError = async (payload) => {
  if (!producer) throw new Error("Kafka producer not connected");
  await producer.send({
    topic: process.env.KAFKA_ERROR_TOPIC,
    messages: [{ value: JSON.stringify([payload]) }],
  });
};

export { producer, connectProducer, sendToData, sendToError };
