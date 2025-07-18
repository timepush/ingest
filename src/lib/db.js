import { SQL } from "bun";
import "dotenv/config";

// Create a postgres.js client with pooling & timeouts
const sql = SQL({
  url: process.env.DATABASE_URL,
  max: 20, // pool size
  idleTimeout: 30, // seconds before idle connection closes
  connectTimeout: 5, // seconds for initial connect
});

export default sql;
