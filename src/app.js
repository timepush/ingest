import { Hono } from "hono";
import { timeout } from "hono/timeout";
import { timing } from "hono/timing";
import { requestId } from "hono/request-id";
import { cors } from "hono/cors";
import { prometheus } from "@hono/prometheus";
import { pinoLogger } from "@/middlewares/pino-logger";
import { auth } from "@/middlewares/auth";
import onError from "@/middlewares/error-handler";
import notFound from "@/middlewares/not-found";
import ingestRoute from "@/features/ingest";
import { registerMetrics, printMetrics } from "@/lib/metrics";

const app = new Hono({ strict: false });

app.use("*", cors({ origin: "*" }));
app.use(requestId());
app.use(pinoLogger());
app.use(timing());
app.use("*", registerMetrics);
app.use(timeout(3000));

app.get("/metrics", printMetrics);
app.use("/ingest/*", auth);
app.route("/ingest", ingestRoute);
app.notFound(notFound);
app.onError(onError);
export default app;
