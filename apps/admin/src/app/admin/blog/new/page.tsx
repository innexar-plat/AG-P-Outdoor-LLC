import { requireModule } from "@/lib/guards";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { BlogNewHeader } from "@/components/admin/BlogNewHeader";

export default async function NewBlogPage() {
  await requireModule("blog");
  return (
    <div className="space-y-6">
      <BlogNewHeader />
      <BlogPostForm />
    </div>
  );
}
