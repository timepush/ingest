import { Hono } from "hono";
import IngestRoute from "./features/ingest/index.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
const ApiRouter = new Hono();
ApiRouter.use("/ingest/*", authMiddleware);
ApiRouter.route("/ingest", IngestRoute);

export default ApiRouter;
