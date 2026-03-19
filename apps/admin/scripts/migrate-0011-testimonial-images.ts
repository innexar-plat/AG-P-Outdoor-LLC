/**
 * Idempotent migration: creates testimonial_images table for multiple photos per testimonial.
 * Run on app startup (Docker) or manually: npm run db:migrate-testimonial-images
 */
import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL ?? "http://127.0.0.1:8080";

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS testimonial_images (
  id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  testimonial_id integer NOT NULL,
  image_url text NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at integer NOT NULL,
  FOREIGN KEY (testimonial_id) REFERENCES testimonials(id) ON DELETE cascade
)
`;

const CREATE_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS testimonial_images_testimonial_id_idx
ON testimonial_images(testimonial_id, sort_order)
`;

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

  const db = createClient({ url });
  await db.execute(CREATE_TABLE_SQL);
  await db.execute(CREATE_INDEX_SQL);
  console.log("[migrate-0011] testimonial_images ready");
}

migrateWithRetry()
  .then(() => {
    console.log("[migrate-0011] Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("[migrate-0011] FAILED:", err);
    process.exit(1);
  });
