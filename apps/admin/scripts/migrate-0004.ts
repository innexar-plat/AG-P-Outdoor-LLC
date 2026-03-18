import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL ?? "http://sqld:8080";

async function main() {
  const client = createClient({ url });
  console.log("[migrate-0004] Adding allowed_modules column to user table...");

  try {
    await client.execute(
      "ALTER TABLE `user` ADD COLUMN `allowed_modules` text",
    );
    console.log("[migrate-0004] Column added successfully.");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("duplicate column") || msg.includes("already exists")) {
      console.log("[migrate-0004] Column already exists, skipping.");
    } else {
      throw err;
    }
  }

  console.log("[migrate-0004] Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("[migrate-0004] FAILED:", err);
  process.exit(1);
});
