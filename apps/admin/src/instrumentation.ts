/**
 * Runs on server startup. Ensures carousel columns exist on site_images.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { ensureCarouselColumns } = await import("@/lib/db-migrate");
  await ensureCarouselColumns();
}
