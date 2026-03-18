import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchYouTubeRSS } from "@/lib/social-embed";
import { z } from "zod";

const querySchema = z.object({
  channelUrl: z.string().url(),
});

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ channelUrl: searchParams.get("channelUrl") });
  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: "channelUrl query parameter required (valid URL)" },
      { status: 400 },
    );
  }

  try {
    const videos = await fetchYouTubeRSS(parsed.data.channelUrl);
    return NextResponse.json({ data: videos, error: null });
  } catch (err) {
    console.error("[admin/social/youtube-feed GET]", err);
    return NextResponse.json({ data: null, error: "Failed to fetch YouTube feed" }, { status: 500 });
  }
}
