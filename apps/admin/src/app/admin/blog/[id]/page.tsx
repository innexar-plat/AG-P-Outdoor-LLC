import { requireModule } from "@/lib/guards";
import { getBlogPostById } from "@/lib/queries/blog";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { BlogEditHeader } from "@/components/admin/BlogEditHeader";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function EditBlogPage({ params }: Props) {
  await requireModule("blog");
  const { id } = await params;
  const numId = Number(id);
  if (Number.isNaN(numId)) notFound();
  const post = await getBlogPostById(numId);
  if (!post) notFound();

  const initial = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    content: post.content,
    coverImage: post.coverImage,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    status: post.status as "draft" | "published",
  };

  return (
    <div className="space-y-6">
      <BlogEditHeader />
      <BlogPostForm initial={initial} />
    </div>
  );
}
