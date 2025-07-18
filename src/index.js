import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import ApiRouter from "./router.js";
import { handleError } from "./lib/errorHandler.js";
import { testConnections, closeConnections } from "./lib/connections.js";

const app = new Hono({ strict: false });

app.use(logger());
app.use("*", cors({ origin: "*" }));
app.onError(handleError);
app.route("", ApiRouter);
app.notFound((c) => c.json({ status: 404, ok: false, message: "Not Found" }));

// Makes sure postgres, redis, and kafka are up and running
await testConnections();

// Start the server
export default {
  port: 3000,
  fetch: app.fetch,
};
