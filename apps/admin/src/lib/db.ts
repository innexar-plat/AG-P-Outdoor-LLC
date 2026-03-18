import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

/**
 * Database client for Turso (libsql).
 * Local dev: http://sqld:8080 (Docker) or http://127.0.0.1:8080.
 * Production: libsql://your-db.turso.io with auth token.
 */
const client = createClient({
  url: process.env.DATABASE_URL ?? "http://127.0.0.1:8080",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client);
