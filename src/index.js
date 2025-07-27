import { serve } from "@hono/node-server";
import { initRedis } from "@/lib/redis";
import { initKafka } from "@/lib/kafka";
import { initDb } from "@/lib/db";

import app from "@/app";
import env from "@/env";

await initDb();
await initRedis();
await initKafka();

const port = env.INGEST_PORT || 5000;
const hostname = "0.0.0.0";
console.log(`Server is running on port http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname,
});
