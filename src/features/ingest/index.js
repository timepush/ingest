import { Hono } from "hono";
import { setMetric, startTime, endTime } from "hono/timing";
import validation from "./validation";
import { sendToData } from "../../lib/kafka";
import "dotenv/config";

const ingestRoute = new Hono();

ingestRoute.post("/raw", validation, async (c) => {
  const payload = await c.req.json();
  const datasourceId = c.get("datasource_id");
  if (!datasourceId) {
    throw new HTTPException(500, { message: "Missing datasource context client_id" });
  }

  const message = {
    datasource_id: datasourceId,
    ...payload,
  };

  startTime(c, "kafka");
  await sendToData(message);
  endTime(c, "kafka");
  console.log("Data sent to timepush-data topic");
  return c.json({ message: "Data sent to timepush-data topic successfully" });
});

export default ingestRoute;
