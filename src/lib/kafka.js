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

export { producer, connectProducer };
