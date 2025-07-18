import postgres from "postgres";
import "dotenv/config";

// Create a postgres.js client with pooling & timeouts
const sql = postgres(process.env.DATABASE_URL, {
  max: 20, // pool size
  idle_timeout: 30, // seconds before idle connection closes
  connect_timeout: 2, // seconds for initial connect
  // ssl: { rejectUnauthorized: false } if you need SSL
});

export default sql;
