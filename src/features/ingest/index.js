import { Hono } from "hono";
import { startTime, endTime } from "hono/timing";
import validation from "./validation";
import { sendToData } from "../../lib/kafka";
import "dotenv/config";

const ingestRoute = new Hono();

ingestRoute.post("/raw", validation, async (c) => {
  const payload = await c.req.json();
  const dataSourceId = c.get("data_source_id");
  if (!dataSourceId) {
    throw new HTTPException(500, { message: "Missing datasource context client_id" });
  }

  const message = {
    data_source_id: dataSourceId,
    ...payload,
  };

  startTime(c, "kafka");
  await sendToData(message);
  endTime(c, "kafka");
  console.log({ value: JSON.stringify(message) });
  console.log("Data queued in timepush-data kafka topic");
  return c.json({ message: "Data queued in timepush-data kafka topic" });
});

export default ingestRoute;
