import { HTTPException } from "hono/http-exception";
import redis from "redis";
import "dotenv/config";

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

client.on("error", (err) => console.error("Redis Client Error", err));
await client.connect();

export const authMiddleware = async (c, next) => {
  const clientId = c.req.header("client_id");
  const clientSecret = c.req.header("client_secret");

  if (!clientId || !clientSecret) {
    throw new HTTPException(400, { message: "Missing client_id or client_secret header" });
  }

  try {
    // Fetch stored secret from Redis
    const storedSecret = await client.hGet(`client:${clientId}`, "secret");

    // Check for valid cahched credentials
    if (storedSecret && storedSecret === clientSecret) {
      await next();
      return;
    }

    // TODO: change to retrieve data from postgres
    if (clientId === "hey" && clientSecret === "ho") {
      await client.hSet(`client:${clientId}`, "secret", clientSecret); // sets validated client into cache
      await next(); // Proceed to the next middleware or handler
      return;
    }

    // If no valid credentials matched
    throw new HTTPException(401, { message: "Unauthorized" });
  } catch (err) {
    console.error("Error in authMiddleware:", err);
    throw new HTTPException(500, { message: err });
  }
};
