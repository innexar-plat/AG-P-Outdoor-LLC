import { uploadToR2 } from "../r2";

const MAX_WIDTH = 2560;
const WEBP_QUALITY = 98;

/**
 * Uploads image: site-images/banners/portfolio = original quality, others = high-quality WebP.
 * @param buffer - Raw image buffer (JPEG, PNG, etc.)
 * @param key - R2 object key e.g. "site-images/home/xxx.jpg"
 * @param mimeType - Original MIME type
 * @param skipCompress - If true, upload original without resize/WebP
 */
export async function compressAndUpload(
  buffer: Buffer,
  key: string,
  mimeType: string,
  skipCompress = false
): Promise<string> {
  if (skipCompress) {
    return uploadToR2(buffer, key, mimeType);
  }

  let compressed: Buffer;
  try {
    const sharp = (await import("sharp")).default;
    compressed = await sharp(buffer)
      .resize(MAX_WIDTH, undefined, { withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 6, smartSubsample: true })
      .toBuffer();
  } catch (err) {
    console.error("[upload] sharp compress failed", err);
    compressed = buffer;
  }
  const outKey = key.replace(/\.[a-z]+$/i, ".webp");
  return uploadToR2(compressed, outKey, "image/webp");
}
