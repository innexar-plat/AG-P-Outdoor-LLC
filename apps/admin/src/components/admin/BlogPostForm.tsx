"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { FileUpload } from "@/components/ui/FileUpload";

type Post = {
  id?: number;
  title: string;
  slug: string;
  content: string;
  coverImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  status: "draft" | "published";
};

interface BlogPostFormProps {
  initial?: Post;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Blog post create/edit form with rich text editor and auto-slug */
export function BlogPostForm({ initial }: BlogPostFormProps) {
  const router = useRouter();
  const { t } = useI18n();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!!initial?.slug);
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.metaDescription ?? "");
  const [status, setStatus] = useState<"draft" | "published">(initial?.status ?? "draft");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!initial?.id;

  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value);
      if (!slugManual) {
        setSlug(slugify(value));
      }
    },
    [slugManual],
  );

  const handleSlugChange = useCallback((value: string) => {
    setSlugManual(true);
    setSlug(slugify(value));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const url = isEdit ? `/api/admin/blog/${initial!.id}` : "/api/admin/blog";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          content,
          coverImage: coverImage || null,
          metaTitle: metaTitle || null,
          metaDescription: metaDescription || null,
          status,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? t("requestFailed"));
        return;
      }
      router.push("/admin/blog");
      router.refresh();
    } catch {
      setError(t("connectionError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardBody className="space-y-5 max-w-3xl">
          <Input
            label={t("title")}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            placeholder="My amazing post"
          />
          <Input
            label={t("slug")}
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            required
            placeholder="my-amazing-post"
            hint={t("slugHint")}
            className="font-mono text-xs"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t("contentLabel")}
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Start writing…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t("coverImage")}
            </label>
            <FileUpload
              folder="blog/covers"
              onUpload={(url) => setCoverImage(url)}
            />
          </div>
          <Input
            label={`${t("coverImage")} URL`}
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://example.com/cover.jpg"
          />
          {coverImage && (
            <div className="relative rounded-lg overflow-hidden border border-surface-border max-w-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImage} alt="Cover preview" className="w-full h-40 object-cover" />
              <button
                type="button"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 text-xs text-red-600"
                onClick={() => setCoverImage("")}
              >
                ✕
              </button>
            </div>
          )}

          <Select
            label={t("status")}
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            options={[
              { value: "draft", label: t("draft") },
              { value: "published", label: t("published") },
            ]}
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4 max-w-3xl">
          <h3 className="text-sm font-semibold text-slate-700">SEO</h3>
          <Input
            label={t("titleTag")}
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Custom title for search engines"
            hint={`${metaTitle.length}/60 ${t("charCount")}`}
          />
          <Input
            label={t("metaDescription")}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Short description for search results"
            hint={`${metaDescription.length}/160 ${t("charCount")}`}
          />
        </CardBody>
      </Card>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" loading={loading}>
          {isEdit ? t("update") : t("create")}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
