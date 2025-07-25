// src/lib/kafkaMetrics.js
import { Counter, Histogram, Gauge, Registry, collectDefaultMetrics } from "prom-client";

export function createKafkaMetrics(registry) {
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
