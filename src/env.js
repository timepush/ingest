import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  APP_PORT: z.coerce.number().default(5000),
  APP_LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
  DATABASE_URL: z.url(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),

  KAFKA_CLIENT_ID: z.string(),
  KAFKA_BROKER: z.string(),
  KAFKA_TOPIC: z.string(),
});

const { data: env, error } = EnvSchema.safeParse(Bun.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(z.treeifyError(error).properties, null, 2));
  process.exit(1);
}

export default env;
