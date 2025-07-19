# Dockerfile for Bun API
FROM oven/bun:1.2.18
WORKDIR /app
COPY . .
RUN bun install
EXPOSE 3000
CMD ["bun", "run", "src/index.js"]
