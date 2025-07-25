import { serve } from "@hono/node-server";
import { initRedis } from "@/lib/redis";
import { initKafka } from "@/lib/kafka";
import { initDb } from "@/lib/db";
import logger from "@/lib/logger";

import { app, kafkaMetrics, redisMetrics } from "@/app";
import env from "@/env";

await initDb();
await initRedis({ logger, metrics: redisMetrics });
await initKafka({ logger, metrics: kafkaMetrics });

const port = 5000;
const hostname = "0.0.0.0";
console.log(`Server is running on port http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname,
});
