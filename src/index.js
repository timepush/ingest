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

app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

await connectProducer();

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
