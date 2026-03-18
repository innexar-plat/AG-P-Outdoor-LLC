import { requireModule } from "@/lib/guards";
import { ApiDocsView } from "@/components/admin/ApiDocsView";

async function fetchDocs() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${baseUrl}/api/docs`, { cache: "no-store" });
    if (res.ok) return res.json();
  } catch {
    /* fallback below */
  }
  return { sections: [], baseUrl: "/api", version: "1.0.0" };
}

export default async function ApiDocsPage() {
  await requireModule("api-docs");
  const docs = await fetchDocs();
  return <ApiDocsView sections={docs.sections ?? []} baseUrl={docs.baseUrl ?? "/api"} version={docs.version ?? "1.0.0"} />;
}
