/**
 * Idempotent migration: portfolio categories/tags and relations.
 * Run on app startup (Docker) or manually: npm run db:migrate-portfolio-taxonomy
 */
import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL ?? "http://127.0.0.1:8080";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

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

  await db.execute(`
    CREATE TABLE IF NOT EXISTS portfolio_categories (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      name text NOT NULL,
      slug text NOT NULL UNIQUE,
      sort_order integer NOT NULL DEFAULT 0,
      active integer NOT NULL DEFAULT 1,
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS portfolio_tags (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      name text NOT NULL,
      slug text NOT NULL UNIQUE,
      created_at integer NOT NULL,
      updated_at integer NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS portfolio_item_categories (
      item_id integer NOT NULL,
      category_id integer NOT NULL,
      created_at integer NOT NULL,
      PRIMARY KEY (item_id, category_id),
      FOREIGN KEY (item_id) REFERENCES portfolio_items(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES portfolio_categories(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS portfolio_item_tags (
      item_id integer NOT NULL,
      tag_id integer NOT NULL,
      created_at integer NOT NULL,
      PRIMARY KEY (item_id, tag_id),
      FOREIGN KEY (item_id) REFERENCES portfolio_items(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES portfolio_tags(id) ON DELETE CASCADE
    )
  `);

  await db.execute("CREATE INDEX IF NOT EXISTS portfolio_categories_sort_idx ON portfolio_categories(sort_order, id)");
  await db.execute("CREATE INDEX IF NOT EXISTS portfolio_item_categories_item_idx ON portfolio_item_categories(item_id)");
  await db.execute("CREATE INDEX IF NOT EXISTS portfolio_item_tags_item_idx ON portfolio_item_tags(item_id)");

  const nowMs = Date.now();
  const defaults = ["residential", "commercial", "sports"];

  for (let idx = 0; idx < defaults.length; idx += 1) {
    const name = defaults[idx];
    const slug = slugify(name);
    try {
      await db.execute({
        sql: `
          INSERT INTO portfolio_categories (name, slug, sort_order, active, created_at, updated_at)
          VALUES (?, ?, ?, 1, ?, ?)
        `,
        args: [name.charAt(0).toUpperCase() + name.slice(1), slug, idx, nowMs, nowMs],
      });
    } catch {
      // category already exists
    }
  }

  const legacy = await db.execute("SELECT id, category FROM portfolio_items WHERE category IS NOT NULL AND TRIM(category) <> ''");

  type LegacyCategoryRow = { id: number | string; category: string | null };
  for (const row of legacy.rows as unknown as LegacyCategoryRow[]) {
    const categoryRaw = String(row.category ?? "").trim();
    if (!categoryRaw) continue;
    const slug = slugify(categoryRaw);

    await db.execute({
      sql: `
        INSERT INTO portfolio_categories (name, slug, sort_order, active, created_at, updated_at)
        VALUES (?, ?, 999, 1, ?, ?)
        ON CONFLICT(slug) DO NOTHING
      `,
      args: [categoryRaw.charAt(0).toUpperCase() + categoryRaw.slice(1), slug, nowMs, nowMs],
    });

    const catRes = await db.execute({
      sql: "SELECT id FROM portfolio_categories WHERE slug = ? LIMIT 1",
      args: [slug],
    });

    const categoryId = Number(catRes.rows?.[0]?.id ?? 0);
    if (!categoryId) continue;

    await db.execute({
      sql: `
        INSERT INTO portfolio_item_categories (item_id, category_id, created_at)
        VALUES (?, ?, ?)
        ON CONFLICT(item_id, category_id) DO NOTHING
      `,
      args: [Number(row.id), categoryId, nowMs],
    });
  }

  console.log("[migrate-0013] portfolio taxonomy ready");
}

migrateWithRetry()
  .then(() => {
    console.log("[migrate-0013] Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("[migrate-0013] FAILED:", err);
    process.exit(1);
  });
