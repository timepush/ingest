# Timepush Ingest API

This is a high-performance API for ingesting data

## Environment Variables

Create a `.env` file or set the following environment variables:

```
NODE_ENV=production
INGEST_PORT=5000
INGEST_LOG_LEVEL=error

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

## Endpoints

- `POST /ingest/raw`

  ### Authentication

  This endpoint requires the following headers:

  - `Authorization: Bearer <client_secret>`
  - `X-Client-ID: <client_id>`

  Example HTTP request:

  ```http
  POST /ingest/raw HTTP/1.1
  Host: localhost:3000
  Authorization: Bearer my-secret
  X-Client-ID: my-client-id
  Content-Type: application/json

  {
    "timestamp": "2025-07-26T12:34:56.789Z",
    "value": 42.5,
    "is_valid": true
  }
  ```

  - `timestamp`: string, ISO 8601 format, must end with `Z` (UTC)
  - `value`: number
  - `is_valid`: boolean
