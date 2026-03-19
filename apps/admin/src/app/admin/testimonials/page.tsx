import { requireModule } from "@/lib/guards";
import { listTestimonials } from "@/lib/queries/testimonials";
import { TestimonialsView } from "@/components/admin/TestimonialsView";
import { normalizeMediaUrl } from "@/lib/media-url";

/** Testimonials admin page (Server Component) */
export default async function TestimonialsPage() {
  await requireModule("testimonials");
  const rows = await listTestimonials();
  const items = rows.map((row) => ({
    ...row,
    photoUrl: row.photoUrl ? normalizeMediaUrl(row.photoUrl) : null,
  }));
  return <TestimonialsView testimonials={items} />;
}
