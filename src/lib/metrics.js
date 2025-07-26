import { Counter, Histogram, Registry, Gauge } from "prom-client";
import { prometheus } from "@hono/prometheus";

const registry = new Registry();
export const kafkaMetrics = createKafkaMetrics(registry);
export const redisMetrics = createRedisMetrics(registry);
export const { printMetrics, registerMetrics } = prometheus({
  registry,
  collectDefaultMetrics: true,
});

function createRedisMetrics(registry) {
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

function createKafkaMetrics(registry) {
  const kafkaMessagesProduced = new Counter({
    name: "kafka_messages_produced_total",
    help: "Total number of Kafka messages produced (batched)",
    registers: [registry],
  });

  const kafkaMessagesFailed = new Counter({
    name: "kafka_messages_failed_total",
    help: "Total number of Kafka messages that failed to send",
    registers: [registry],
  });

  const kafkaBatchSize = new Histogram({
    name: "kafka_batch_size",
    help: "Number of messages per Kafka batch",
    buckets: [1, 10, 50, 100, 250, 500],
    registers: [registry],
  });

  const kafkaFlushDuration = new Histogram({
    name: "kafka_flush_duration_ms",
    help: "Time taken to flush a batch to Kafka in ms",
    buckets: [10, 50, 100, 200, 500, 1000],
    registers: [registry],
  });

  const kafkaBufferSizeGauge = new Gauge({
    name: "kafka_buffer_queue_size",
    help: "Current number of items in the Kafka buffer",
    registers: [registry],
  });

  // Number of flush operations attempted
  const kafkaFlushCount = new Counter({
    name: "kafka_flush_total",
    help: "Total number of Kafka buffer flush operations",
    registers: [registry],
  });

  // Gauge for concurrent flushes in progress
  const kafkaFlushInProgress = new Gauge({
    name: "kafka_flush_in_progress",
    help: "Number of Kafka flush operations currently in progress",
    registers: [registry],
  });

  // Buffer wait time for each message
  const kafkaBufferWaitTime = new Histogram({
    name: "kafka_buffer_wait_time_ms",
    help: "Time each message spends waiting in buffer before flush (ms)",
    buckets: [1, 5, 10, 50, 100, 200, 500],
    registers: [registry],
  });

  // Number of failed flush attempts
  const kafkaFlushFailedCount = new Counter({
    name: "kafka_flush_failed_total",
    help: "Total number of Kafka flush operations that failed",
    registers: [registry],
  });

  return {
    kafkaMessagesProduced,
    kafkaMessagesFailed,
    kafkaBatchSize,
    kafkaFlushDuration,
    kafkaBufferSizeGauge,
    kafkaFlushCount,
    kafkaFlushInProgress,
    kafkaBufferWaitTime,
    kafkaFlushFailedCount,
  };
}
