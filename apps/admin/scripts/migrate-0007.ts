import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL ?? "http://sqld:8080";

async function main() {
  const client = createClient({ url });
  console.log("[migrate-0007] Creating page_views table...");

  await client.execute(`
    CREATE TABLE IF NOT EXISTS page_views (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      page_path text NOT NULL,
      session_id text,
      referrer text,
      device_category text,
      created_at integer NOT NULL
    )
  `);

  await client.execute(
    "CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at)"
  );
  await client.execute(
    "CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path)"
  );

  console.log("[migrate-0007] Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("[migrate-0007] FAILED:", err);
  process.exit(1);
});
