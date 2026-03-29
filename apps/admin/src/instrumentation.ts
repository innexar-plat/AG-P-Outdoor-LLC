/**
 * Runs on server startup. Ensures additive runtime columns exist.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { ensureRuntimeColumns } = await import("@/lib/db-migrate");
  await ensureRuntimeColumns();
}
