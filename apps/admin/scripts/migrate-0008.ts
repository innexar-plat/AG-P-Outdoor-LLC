/**
 * Idempotent migration: adds carousel columns to site_images.
 * Run on app startup (Docker) or manually: npm run db:migrate-carousel
 */
import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL ?? "http://127.0.0.1:8080";

const COLUMNS = [
  { name: "carousel_items", sql: 'ALTER TABLE site_images ADD COLUMN carousel_items text' },
  { name: "carousel_interval", sql: 'ALTER TABLE site_images ADD COLUMN carousel_interval integer' },
  { name: "carousel_effect", sql: 'ALTER TABLE site_images ADD COLUMN carousel_effect text' },
] as const;

async function migrateWithRetry(maxAttempts = 10): Promise<void> {
  const client = createClient({ url });
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await client.execute("SELECT 1");
      break;
    } catch {
      if (attempt === maxAttempts) throw new Error("Database unreachable after " + maxAttempts + " attempts");
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  const client2 = createClient({ url });
  for (const col of COLUMNS) {
    try {
      await client2.execute(col.sql);
      console.log("[migrate-0008] Added column", col.name);
    } catch (err: unknown) {
      const msg = String(err instanceof Error ? err.message : err);
      if (/duplicate column|already exists/i.test(msg)) {
        console.log("[migrate-0008] Column", col.name, "already exists, skipping");
      } else {
        throw err;
      }
    }
  }
}

migrateWithRetry()
  .then(() => {
    console.log("[migrate-0008] Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("[migrate-0008] FAILED:", err);
    process.exit(1);
  });
