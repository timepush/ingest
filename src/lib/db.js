import { SQL } from "bun";
import env from "@/env";

export const sql = SQL({
  url: env.DATABASE_URL,
  max: 30, // pool size
  idleTimeout: 30, // seconds before idle connection closes
  connectTimeout: 5, // seconds for initial connect
});

export async function initDb() {
  try {
    await sql`SELECT 1`;
    console.info("✅ Connected to Database");
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
}
