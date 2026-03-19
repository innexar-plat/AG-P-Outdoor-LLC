import { NextResponse } from "next/server";
import { getSiteImagesBySection } from "@/lib/queries/images";

function isPrivateIpv4(hostname: string): boolean {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;

  const a = Number(match[1]);
  const b = Number(match[2]);
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

function normalizeMediaUrl(value: string | null | undefined): string {
  if (!value) return "";
  if (value.startsWith("data:")) return value;
  if (value.startsWith("/api/site/storage/") || value.startsWith("/admin/api/site/storage/")) {
    return value;
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      const host = url.hostname.toLowerCase();
      const isPrivateHost =
        host === "localhost" ||
        host.endsWith(".local") ||
        host.endsWith(".internal") ||
        host.endsWith(".sslip.io") ||
        isPrivateIpv4(host);

      if (!isPrivateHost) return value;
      if (!url.pathname || url.pathname === "/") return value;
      return `/api/site/storage${url.pathname}`;
    } catch {
      return value;
    }
  }

  if (value.startsWith("/")) {
    return `/api/site/storage${value}`;
  }

  return `/api/site/storage/${value}`;
}

/**
 * GET /api/site/images/[section] — images for a section. No auth.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ section: string }> },
) {
  const { section } = await params;
  try {
    const rows = await getSiteImagesBySection(section);
    const normalized = rows.map((row) => ({
      ...row,
      url: normalizeMediaUrl(row.url),
    }));
    return NextResponse.json({ data: normalized, error: null });
  } catch (err) {
    console.error("[site/images/[section] GET]", err);
    return NextResponse.json({ data: null, error: "Something went wrong" }, { status: 500 });
  }
}
