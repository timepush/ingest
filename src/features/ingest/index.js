import { Hono } from "hono";
import { startTime, endTime } from "hono/timing";
import { enqueue } from "@/lib/kafka";
import validation from "./validation";
import env from "@/env";
import { HTTPException } from "hono/http-exception";
import { BAD_REQUEST } from "@/lib/http-status-codes";

const ingestRoute = new Hono();

ingestRoute.post("/raw", validation, async (c) => {
  const payload = await c.req.json();
  const dataSourceId = c.get("data_source_id");
  if (!dataSourceId) throw new HTTPException(BAD_REQUEST, { message: "Missing data_source_id in request context" });

  const message = {
    data_source_id: dataSourceId,
    ...payload,
  };

  await enqueue(message);
  return c.json({ message: `Data queued in ${env.KAFKA_TOPIC} kafka topic` });
});

export default ingestRoute;
