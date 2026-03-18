import { requireModule } from "@/lib/guards";
import { listSocialPosts } from "@/lib/queries/social";
import { SocialView } from "@/components/admin/social";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";

export default async function SocialPage() {
  await requireModule("social");

  const [posts, ytSetting] = await Promise.all([
    listSocialPosts(),
    db.select().from(settings).where(eq(settings.key, "social_youtube")).limit(1),
  ]);

  const youtubeChannelUrl = ytSetting[0]?.value ?? null;

  return <SocialView posts={posts} youtubeChannelUrl={youtubeChannelUrl} />;
}
