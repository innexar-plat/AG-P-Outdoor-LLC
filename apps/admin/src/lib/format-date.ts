/**
 * Format date for display. Uses fixed "en-US" locale to avoid hydration mismatch
 * between server (Node) and client (browser) when locale differs.
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (date == null) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
