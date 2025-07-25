import { Counter, Histogram, Registry, collectDefaultMetrics } from "prom-client";

export function createRedisMetrics(registry) {
  const redisCommandTotal = new Counter({
    name: "redis_commands_total",
    help: "Total number of Redis commands executed",
    labelNames: ["command"],
    registers: [registry],
  });

  const redisCommandErrors = new Counter({
    name: "redis_command_errors_total",
    help: "Total number of Redis command errors",
    labelNames: ["command"],
    registers: [registry],
  });

  const redisCommandLatency = new Histogram({
    name: "redis_command_duration_seconds",
    help: "Latency of Redis commands",
    labelNames: ["command"],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
    registers: [registry],
  });

  return { redisCommandTotal, redisCommandErrors, redisCommandLatency };
}
