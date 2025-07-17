import { log } from "console";
import { sendToError } from "./kafka.js";
import { HTTPException } from "hono/http-exception";

export async function handleError(err, c) {
  let errorMessage = err.message;
  // Special handling for ZodError (from zod-validator)
  if (err.name === "ZodError" && err.message) {
    try {
      const parsed = JSON.parse(err.message);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].message) {
        errorMessage = parsed[0].message;
      }
    } catch (_) {
      // fallback to original message
    }
  }

  try {
    var payload = await c.req.json();
    await sendToError({
      error_descr: errorMessage,
      raw_message: JSON.stringify(payload || null),
      error_time: new Date().toISOString(),
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
