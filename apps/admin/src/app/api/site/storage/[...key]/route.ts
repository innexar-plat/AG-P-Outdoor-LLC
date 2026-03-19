import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { bucketName, r2 } from "@/lib/r2";

const COMMON_MEDIA_PREFIXES = [
  "site-images/home",
  "site-images/services",
  "site-images/residential-turf",
  "site-images/putting-green",
  "site-images/pet-turf",
  "site-images/commercial-turf",
  "site-images/pavers",
  "site-images/drainage-grading",
  "site-images/grass-removal",
  "site-images/contact",
  "site-images/about",
  "site-images/blog",
  "site-images/portfolio",
  "site-images",
  "portfolio",
  "testimonials",
  "banners",
  "blog",
  "uploads",
];

const IMAGE_EXTENSIONS = [".webp", ".jpeg", ".jpg", ".png", ".gif", ".svg"];
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi"];

function withExtensionVariants(key: string): string[] {
  const out = new Set<string>();
  const normalized = key.replace(/^\/+/, "");
  if (!normalized) return [];

  out.add(normalized);

  const dot = normalized.lastIndexOf(".");
  if (dot <= 0) return Array.from(out);

  const base = normalized.slice(0, dot);
  const ext = normalized.slice(dot).toLowerCase();
  const variants = VIDEO_EXTENSIONS.includes(ext) ? VIDEO_EXTENSIONS : IMAGE_EXTENSIONS;
  for (const v of variants) {
    out.add(`${base}${v}`);
  }

  return Array.from(out);
}

function basename(path: string): string {
  const clean = path.replace(/^\/+/, "");
  const parts = clean.split("/");
  return parts[parts.length - 1] ?? clean;
}

function buildCandidateKeys(rawKey: string): string[] {
  const normalized = rawKey.replace(/^\/+/, "");
  if (!normalized) return [];

  const candidates = new Set<string>();

  if (normalized.startsWith("uploads/")) {
    candidates.add(normalized);
    candidates.add(normalized.replace(/^uploads\//, ""));
  } else {
    candidates.add(normalized);
    candidates.add(`uploads/${normalized}`);
  }

  // Legacy compatibility: if key is only a filename, try known media folders.
  if (!normalized.includes("/")) {
    for (const prefix of COMMON_MEDIA_PREFIXES) {
      candidates.add(`${prefix}/${normalized}`);
      if (!prefix.startsWith("uploads/")) {
        candidates.add(`uploads/${prefix}/${normalized}`);
      }
    }
  }

  const fileName = basename(normalized);
  if (fileName && fileName !== normalized) {
    // If path is wrong but filename is right, try resolving from known prefixes.
    for (const prefix of COMMON_MEDIA_PREFIXES) {
      candidates.add(`${prefix}/${fileName}`);
      if (!prefix.startsWith("uploads/")) {
        candidates.add(`uploads/${prefix}/${fileName}`);
      }
    }
  }

  const expanded = new Set<string>();
  for (const candidate of candidates) {
    for (const item of withExtensionVariants(candidate)) {
      expanded.add(item);
    }
  }

  return Array.from(expanded);
}

/**
 * GET /api/site/storage/[...key] — public proxy for storage objects.
 * Useful when stored URLs point to private/internal endpoints.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const objectKey = Array.isArray(key) ? key.map(decodeURIComponent).join("/") : "";

  if (!objectKey || !r2 || !bucketName) {
    return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
  }

  const candidateKeys = buildCandidateKeys(objectKey);
  const rangeHeader = request.headers.get("range") ?? undefined;

  for (const candidate of candidateKeys) {
    try {
      const object = await r2.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: candidate,
          ...(rangeHeader ? { Range: rangeHeader } : {}),
        }),
      );

      if (!object.Body) continue;

      const bytes = await object.Body.transformToByteArray();

      const headers: Record<string, string> = {
        "Content-Type": object.ContentType ?? "application/octet-stream",
        "Cache-Control": object.CacheControl ?? "public, max-age=31536000, immutable",
        "Accept-Ranges": "bytes",
        ...(object.ETag ? { ETag: object.ETag } : {}),
      };

      if (object.ContentLength != null) {
        headers["Content-Length"] = String(object.ContentLength);
      }

      if (object.ContentRange) {
        headers["Content-Range"] = object.ContentRange;
      }

      return new NextResponse(Buffer.from(bytes), {
        status: object.ContentRange ? 206 : 200,
        headers,
      });
    } catch {
      // Try next candidate key.
    }
  }

  console.error("[site/storage/[...key] GET] object not found", { objectKey, candidateKeys });
  return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
}
