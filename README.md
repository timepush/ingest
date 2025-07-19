# Ingest API

High-performance event ingestion API using Bun, Hono, Kafka, Redis, and Postgres. Supports horizontal scaling with Docker Compose and Nginx load balancing.

---

## Prerequisites

- [Bun](https://bun.sh/) installed (for local dev)
- Docker & Docker Compose (for production or multi-instance)
- Kafka, Redis, and Postgres running (can be on host or in Docker)

---

## Quick Start (Docker Compose)

1. Copy `.env.example` to `.env` and fill in your connection details for Kafka, Redis, and Postgres.
2. Build and start the stack (scaling API to 4 instances):

   ```sh
   docker-compose up --build --scale api=4
   ```

3. Access the API via Nginx load balancer:

   - http://localhost:8080

---

## Local Development

1. Install dependencies:
   ```sh
   bun install
   ```
2. Start the API:
   ```sh
   bun run src/index.js
   ```
3. Open [http://localhost:3000](http://localhost:3000) or use curl/Postman.

---

## Usage Example

POST data to the ingest endpoint and view response headers:

```sh
curl -X POST http://localhost:8080/ingest/raw \
  -H "Content-Type: application/json" \
  -d '{"your":"data"}' \
  -i
```

---

## Environment Variables

Set up a `.env` file with your connection details. Example:

```env
API_PORT=3000
REDIS_HOST=host.docker.internal
REDIS_PORT=6379
KAFKA_CLIENT_ID=timepush-ingest-api
KAFKA_BROKER=host.docker.internal:29092
KAFKA_DATA_TOPIC=timepush-data
KAFKA_ERROR_TOPIC=timepush-error
DATABASE_URL=postgresql://user:pass@host.docker.internal:5432/db
```

---

## Scaling

To change the number of API instances:

```sh
docker-compose up --scale api=8
```

Nginx will automatically load balance across all running API containers.

---

## Notes

- The API will not start unless it can connect to Kafka, Redis, and Postgres.
- For best performance, tune Nginx and system limits for high concurrency.
- You can run with Bun directly for local dev, or use Docker Compose for production-like scaling.
