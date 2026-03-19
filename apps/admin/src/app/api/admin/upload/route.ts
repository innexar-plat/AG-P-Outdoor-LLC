import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { r2 } from "@/lib/r2";

const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const VIDEO_MAX_SIZE = 200 * 1024 * 1024; // 200MB for hero videos

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const uploadMetaSchema = z.object({
  folder: z.string().min(1).max(200).default("uploads"),
});

/**
 * POST /api/admin/upload — upload a file (image or video) to R2 / MinIO
 * Accepts multipart/form-data with a "file" field and optional "folder" field
 */
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ data: null, error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ data: null, error: "No file provided" }, { status: 400 });
  }

  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
  const maxSize = isVideo ? VIDEO_MAX_SIZE : IMAGE_MAX_SIZE;

  if (file.size > maxSize) {
    const limitMb = maxSize / 1024 / 1024;
    return NextResponse.json({ data: null, error: `File too large (max ${limitMb}MB)` }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ data: null, error: `Unsupported file type: ${file.type}` }, { status: 400 });
  }

  const meta = uploadMetaSchema.safeParse({ folder: formData.get("folder") ?? "uploads" });
  if (!meta.success) {
    return NextResponse.json({ data: null, error: "Invalid folder" }, { status: 400 });
  }

  const folder = meta.data.folder;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? (isVideo ? "mp4" : "webp");
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (r2) {
      const { compressAndUpload } = await import("@/lib/services/upload");
      // Videos and certain image slots skip compression
      const skipCompress =
        isVideo ||
        folder.startsWith("site-images") ||
        folder.startsWith("banners") ||
        folder.startsWith("portfolio");
      const url = await compressAndUpload(buffer, key, file.type, skipCompress);
      return NextResponse.json({ data: { url, key }, error: null });
    }

    // No R2 configured: return data URL (image only; videos would be too large)
    if (isVideo) {
      return NextResponse.json({ data: null, error: "Storage not configured for video upload" }, { status: 503 });
    }
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;
    return NextResponse.json({
      data: { url: dataUrl, key, r2: false },
      error: null,
    });
  } catch (err) {
    console.error("[admin/upload POST]", err);
    return NextResponse.json({ data: null, error: "Upload failed" }, { status: 500 });
  }
}

