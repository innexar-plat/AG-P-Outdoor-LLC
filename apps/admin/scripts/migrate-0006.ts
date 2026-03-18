import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL ?? "http://sqld:8080";

async function main() {
  const client = createClient({ url });
  console.log("[migrate-0006] Creating social_posts table...");

  await client.execute(`
    CREATE TABLE IF NOT EXISTS social_posts (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      platform text NOT NULL,
      post_url text NOT NULL,
      embed_html text,
      title text,
      thumbnail_url text,
      published_at integer,
      pinned integer NOT NULL DEFAULT 0,
      sort_order integer NOT NULL DEFAULT 0,
      created_at integer NOT NULL
    )
  `);

  console.log("[migrate-0006] Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("[migrate-0006] FAILED:", err);
  process.exit(1);
});
