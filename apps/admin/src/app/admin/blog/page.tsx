import { requireModule } from "@/lib/guards";
import { listBlogPosts } from "@/lib/queries/blog";
import { BlogListView } from "@/components/admin/BlogListView";

export default async function BlogListPage() {
  await requireModule("blog");
  const posts = await listBlogPosts({ limit: 50 });
  return <BlogListView posts={posts} />;
}
