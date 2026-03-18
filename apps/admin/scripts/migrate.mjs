import { createClient } from "@libsql/client";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const url = process.env.DATABASE_URL ?? "http://127.0.0.1:8080";
const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });

const dir = join(import.meta.dirname, "../drizzle");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  const sql = readFileSync(join(dir, file), "utf-8");
  const stmts = sql.split(";").map((s) => s.trim()).filter(Boolean);
  for (const stmt of stmts) {
    await client.execute(stmt);
  }
  console.log(`[migrate] Applied ${file}`);
}

console.log("[migrate] All migrations applied.");
