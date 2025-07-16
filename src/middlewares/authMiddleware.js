import { HTTPException } from "hono/http-exception";
import { createHash } from "crypto";
import bcrypt from "bcrypt";
import "dotenv/config";
import sql from "../lib/db.js";
import { getRedis } from "../lib/redis.js";

export const authMiddleware = async (c, next) => {
  const client = await getRedis();
  const authHeader = c.req.header("Authorization") || "";
  const clientId = c.req.header("X-Client-ID");
  if (!authHeader.startsWith("Bearer ") || !clientId) {
    throw new HTTPException(400, { message: "Missing Authorization or X-Client-ID header" });
  }

  const rawSecret = authHeader.slice(7).trim(); // remove "Bearer "
  const fp = createHash("sha256").update(rawSecret, "utf8").digest("hex");

  const cacheKey = `ds:client:${clientId}:fp:${fp}`;
  let datasourceId = await client.get(cacheKey);

  if (!datasourceId) {
    const rows = await sql`
        SELECT id, client_secret_hash
        FROM data_sources
        WHERE client_id = ${clientId}
    `;

    if (rows.length === 0) {
      throw new HTTPException(401, { message: "Invalid client_id" });
    }
    const { id, client_secret_hash } = rows[0];

    const ok = await bcrypt.compare(rawSecret, client_secret_hash);
    if (!ok) {
      throw new HTTPException(401, { message: "Invalid client_secret" });
    }

    datasourceId = id.toString();
    await client.set(cacheKey, datasourceId, { EX: 3600 });
  }

  c.set("datasource_id", datasourceId);
  return next();
};
