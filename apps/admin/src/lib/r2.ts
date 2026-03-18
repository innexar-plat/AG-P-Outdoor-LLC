import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

/**
 * S3-compatible storage client.
 *
 * Priority:
 *   1. R2_ACCOUNT_ID + R2_BUCKET_NAME → Cloudflare R2 (production)
 *   2. S3_ENDPOINT + S3_BUCKET_NAME  → MinIO or any S3-compatible (dev/fallback)
 *   3. Neither → null (upload falls back to base64 data URLs)
 */

const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2Bucket = process.env.R2_BUCKET_NAME;

const s3Endpoint = process.env.S3_ENDPOINT;
const s3Bucket = process.env.S3_BUCKET_NAME;

type StorageConfig = {
  client: S3Client;
  bucket: string;
  publicUrl: string;
  provider: "r2" | "s3";
};

function buildConfig(): StorageConfig | null {
  if (r2AccountId && r2Bucket) {
    return {
      client: new S3Client({
        region: "auto",
        endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
        },
      }),
      bucket: r2Bucket,
      publicUrl: process.env.R2_PUBLIC_URL ?? "",
      provider: "r2",
    };
  }

  if (s3Endpoint && s3Bucket) {
    const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";
    return {
      client: new S3Client({
        region: process.env.S3_REGION ?? "us-east-1",
        endpoint: s3Endpoint,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
        },
        forcePathStyle,
      }),
      bucket: s3Bucket,
      publicUrl: process.env.S3_PUBLIC_URL ?? "",
      provider: "s3",
    };
  }

  return null;
}

const storage = buildConfig();

/** The S3 client (R2, MinIO, or null) */
export const r2 = storage?.client ?? null;

/** Active bucket name */
export const bucketName = storage?.bucket ?? null;

/** Storage provider label */
export const storageProvider = storage?.provider ?? null;

/**
 * Uploads a file buffer to S3-compatible storage and returns the public URL.
 */
export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  if (!storage) {
    throw new Error(
      "Storage is not configured. Set R2_* (production) or S3_* (dev/MinIO) environment variables.",
    );
  }

  await storage.client.send(
    new PutObjectCommand({
      Bucket: storage.bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    }),
  );

  const base = storage.publicUrl.replace(/\/$/, "");
  return base ? `${base}/${key}` : key;
}

/**
 * Deletes an object by key.
 */
export async function deleteFromR2(key: string): Promise<void> {
  if (!storage) return;
  await storage.client.send(
    new DeleteObjectCommand({
      Bucket: storage.bucket,
      Key: key,
    }),
  );
}
