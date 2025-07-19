import { Hono } from "hono";
import { timeout } from "hono/timeout";
import IngestRoute from "./features/ingest/index.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
const ApiRouter = new Hono();

ApiRouter.use("*", timeout(30000)); // Set a 30-second timeout for all routes
ApiRouter.use("/ingest/*", authMiddleware);
ApiRouter.route("/ingest", IngestRoute);

export default ApiRouter;
