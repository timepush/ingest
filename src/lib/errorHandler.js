import { sendToError } from "./kafka.js";
import { HTTPException } from "hono/http-exception";

export async function handleError(err, c) {
  try {
    await sendToError({
      message: err.message,
      stack: err.stack,
      path: c.req.path,
      method: c.req.method,
      status: err.status || 500,
      timestamp: new Date().toISOString(),
      datasource_id: c.get("datasource_id") || null,
    });
  } catch (kafkaErr) {
    console.error("Failed to send error to Kafka:", kafkaErr);
  }

  if (err instanceof HTTPException) {
    return c.json({ status: err.status, ok: false, message: err.message }, err.status);
  }
  return c.json({ status: 500, ok: false, message: "Internal Server Error" }, 500);
}
