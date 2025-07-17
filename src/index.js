import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import ApiRouter from "./router.js";
import { connectProducer } from "./lib/kafka.js";
import { handleError } from "./lib/errorHandler.js";

const app = new Hono({ strict: false });

app.use(logger());
app.use("*", cors({ origin: "*" }));
app.onError(handleError);
app.route("", ApiRouter);
app.notFound((c) => c.json({ status: 404, ok: false, message: "Not Found" }));

async function bootstrap() {
  try {
    // 1. Attempt Kafka connect before opening HTTP port
    await connectProducer();
    console.log("[Startup] Kafka producer ready");

    // 2. Only once Kafka is connected do we start the server
    serve({ fetch: app.fetch, port: 3000 }, (info) => console.log(`Server is running on http://localhost:${info.port}`));
  } catch (err) {
    console.error("[Startup] Failed to start — Kafka unavailable:", err);
    process.exit(1); // crash early so your infra can restart you
  }
}

bootstrap();
