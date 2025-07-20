import { log } from "console";
import { sendToError } from "./kafka.js";
import { HTTPException } from "hono/http-exception";

export async function handleError(err, c) {
  let errorMessage = err.message;
  try {
    var payload = await c.req.json();
    await sendToError({
      description: errorMessage,
      payload: JSON.stringify(payload || null),
      occurred_at: new Date().toISOString(),
      datasource_id: c.get("datasource_id") || null,
    });
  } catch (kafkaErr) {
    console.error("Failed to send error to Kafka:", kafkaErr);
  }

  if (err instanceof HTTPException) {
    return c.json({ status: err.status, ok: false, message: errorMessage }, err.status);
  }
  return c.json({ status: 500, ok: false, message: errorMessage }, 500);
}
