import { requireModule } from "@/lib/guards";
import { listTestimonials } from "@/lib/queries/testimonials";
import { TestimonialsView } from "@/components/admin/TestimonialsView";

/** Testimonials admin page (Server Component) */
export default async function TestimonialsPage() {
  await requireModule("testimonials");
  const items = await listTestimonials();
  return <TestimonialsView testimonials={items} />;
}
