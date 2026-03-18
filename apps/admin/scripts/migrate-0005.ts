import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL ?? "http://sqld:8080";

const COLUMNS = [
  "ALTER TABLE `banners` ADD COLUMN `size` text NOT NULL DEFAULT 'sidebar'",
  "ALTER TABLE `banners` ADD COLUMN `custom_width` integer",
  "ALTER TABLE `banners` ADD COLUMN `custom_height` integer",
  "ALTER TABLE `banners` ADD COLUMN `layout` text NOT NULL DEFAULT 'card'",
  "ALTER TABLE `banners` ADD COLUMN `animation` text NOT NULL DEFAULT 'fade'",
  "ALTER TABLE `banners` ADD COLUMN `carousel_group` text",
  "ALTER TABLE `banners` ADD COLUMN `carousel_interval` integer NOT NULL DEFAULT 5",
  "ALTER TABLE `banners` ADD COLUMN `border_radius` integer NOT NULL DEFAULT 12",
  "ALTER TABLE `banners` ADD COLUMN `opacity` integer NOT NULL DEFAULT 100",
];

async function main() {
  const client = createClient({ url });
  console.log("[migrate-0005] Adding banner layout columns...");

  for (const sql of COLUMNS) {
    const col = sql.match(/`(\w+)`\s*(?:text|integer)/)?.[1] ?? "?";
    try {
      await client.execute(sql);
      console.log(`  + ${col} added`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("duplicate") || msg.includes("already exists")) {
        console.log(`  ~ ${col} already exists`);
      } else {
        throw err;
      }
    }
  }

  console.log("[migrate-0005] Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("[migrate-0005] FAILED:", err);
  process.exit(1);
});
