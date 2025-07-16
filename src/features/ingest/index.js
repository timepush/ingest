import { Hono } from "hono";
import validation from "./validation";
import { producer } from "../../lib/kafka";
import "dotenv/config";

const ingestRoute = new Hono();

ingestRoute.post("/raw", validation, async (c) => {
  const payload = await c.req.json();

  try {
    await producer.send({
      topic: process.env.KAFKA_DATA_TOPIC,
      messages: [{ value: JSON.stringify([payload]) }],
    });

    return c.json({ message: "Data sent to timepush-data topic successfully", payload });
  } catch (error) {
    console.error("Error sending to Kafka:", error);
    return c.json({ error: "Failed to send data" }, 500);
  }
});

export default ingestRoute;
