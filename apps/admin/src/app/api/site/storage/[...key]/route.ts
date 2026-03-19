import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { bucketName, r2 } from "@/lib/r2";

/**
 * GET /api/site/storage/[...key] — public proxy for storage objects.
 * Useful when stored URLs point to private/internal endpoints.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = Array.isArray(key) ? key.map(decodeURIComponent).join("/") : "";

  if (!objectKey || !r2 || !bucketName) {
    return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  }

  try {
    const object = await r2.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      }),
    );

    if (!object.Body) {
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    }

    const bytes = await object.Body.transformToByteArray();

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": object.ContentType ?? "application/octet-stream",
        "Cache-Control": object.CacheControl ?? "public, max-age=31536000, immutable",
        ...(object.ETag ? { ETag: object.ETag } : {}),
      },
    });
  } catch (err) {
    console.error("[site/storage/[...key] GET]", err);
    return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  }
}
