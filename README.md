# Timepush Ingest API

This is a high-performance API for ingesting data

## Environment Variables

Create a `.env` file or set the following environment variables:

```
NODE_ENV=production
APP_PORT=5000
APP_LOG_LEVEL=error

REDIS_HOST=localhost
REDIS_PORT=6379

KAFKA_CLIENT_ID=timepush-ingest-api
KAFKA_BROKER=localhost:29092
KAFKA_TOPIC=timepush-data

DATABASE_URL=postgresql://timepush:timepush@localhost:5432/timepush
```

## Running Locally (with Bun)

1. Install dependencies:
   ```sh
   bun install
   ```
2. Start the API:
   ```sh
   bun run src/index.js
   ```
3. The API will be available at `http://localhost:3000`.

## Running with Docker

1. Build the Docker image:
   ```sh
   docker build -t timepush-ingest .
   ```
2. Run the container:
   ```sh
   docker run --env-file .env -p 3000:3000 timepush-ingest
   ```

## Endpoints

- `POST /ingest` — Ingest data (see API docs or code for payload format)
