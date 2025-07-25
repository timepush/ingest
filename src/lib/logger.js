import pino from "pino";
import pretty from "pino-pretty";
import env from "@/env";

const transport = {
  target: "hono-pino/debug-log", //"pino-pretty",
  options: { colorize: true },
};

const logger = pino(
  {
    level: env.INGEST_LOG_LEVEL || "info",
    transport: env.NODE_ENV === "production" ? undefined : transport,
    timestamp: pino.stdTimeFunctions.unixTime, // hh:mm:ss
  },
  env.NODE_ENV === "production" ? undefined : pretty()
);

export default logger;
