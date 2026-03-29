/**
 * Runtime migrations for additive columns used by recent features.
 * Called from instrumentation.ts on server startup.
 */
import { createClient } from "@libsql/client";

const COLUMNS = [
  { name: "carousel_items", sql: "ALTER TABLE site_images ADD COLUMN carousel_items text" },
  { name: "carousel_interval", sql: "ALTER TABLE site_images ADD COLUMN carousel_interval integer" },
  { name: "carousel_effect", sql: "ALTER TABLE site_images ADD COLUMN carousel_effect text" },
  { name: "lead_status", sql: "ALTER TABLE form_submissions ADD COLUMN lead_status text DEFAULT 'new'" },
  { name: "crm_comment", sql: "ALTER TABLE form_submissions ADD COLUMN crm_comment text" },
] as const;

export async function ensureRuntimeColumns(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) return;

  const client = createClient({ url });
  for (const col of COLUMNS) {
    try {
      await client.execute(col.sql);
      console.log("[db-migrate] Added column", col.name);
    } catch (err: unknown) {
      const msg = String(err instanceof Error ? err.message : err);
      if (/duplicate column|already exists/i.test(msg)) {
        // Column exists, skip
      } else {
        console.warn("[db-migrate] Could not add", col.name, ":", msg);
      }
    }
  }
}
