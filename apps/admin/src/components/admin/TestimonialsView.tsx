"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Table, Thead, Th, Td, TableEmpty } from "@/components/ui/Table";
import { SlideOver } from "@/components/ui/SlideOver";
import { FileUpload } from "@/components/ui/FileUpload";
import { MultiFileUpload } from "@/components/ui/MultiFileUpload";

type Testimonial = {
  id: number;
  name: string;
  location: string | null;
  photoUrl: string | null;
  photoUrls: string[];
  text: string;
  rating: number;
  approved: boolean;
  sortOrder: number;
  createdAt: Date;
};

interface TestimonialsViewProps {
  testimonials: Testimonial[];
}

const EMPTY: Testimonial = {
  id: 0,
  name: "",
  location: "",
  photoUrl: null,
  photoUrls: [],
  text: "",
  rating: 5,
  approved: false,
  sortOrder: 0,
  createdAt: new Date(),
};

/** Testimonials CRUD with approve toggle */
export function TestimonialsView({ testimonials: initial }: TestimonialsViewProps) {
  const { t } = useI18n();
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!editing) return;
    setLoading(true);
    try {
      const isNew = editing.id === 0;
      const url = isNew ? "/admin/api/admin/testimonials" : `/admin/api/admin/testimonials/${editing.id}`;
      const method = isNew ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editing.name,
          location: editing.location || null,
          photoUrl: editing.photoUrl || null,
          photoUrls: editing.photoUrls,
          text: editing.text,
          rating: editing.rating,
          approved: editing.approved,
          sortOrder: editing.sortOrder,
        }),
      });
      if (res.ok) {
        setEditing(null);
        router.refresh();
        const { data } = await res.json();
        if (isNew) {
          setItems((prev) => [...prev, data]);
        } else {
          setItems((prev) => prev.map((i) => (i.id === data.id ? data : i)));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(t("confirmRemoveTestimonial"))) return;
    await fetch(`/admin/api/admin/testimonials/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    router.refresh();
  }

  async function toggleApproval(item: Testimonial) {
    await fetch(`/admin/api/admin/testimonials/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: !item.approved }),
    });
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, approved: !i.approved } : i)));
  }

  function renderStars(rating: number) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("testimonials")}
        description={t("testimonialsDesc")}
        actions={
          <Button onClick={() => setEditing({ ...EMPTY, sortOrder: items.length })}>
            {t("newTestimonial")}
          </Button>
        }
      />

      <Card>
        <Table>
          <Thead>
            <tr>
              <Th>{t("name")}</Th>
              <Th>{t("location")}</Th>
              <Th>{t("rating")}</Th>
              <Th>{t("status")}</Th>
              <Th>{t("actions")}</Th>
            </tr>
          </Thead>
          <tbody>
            {items.length === 0 && <TableEmpty colSpan={5} message={t("noTestimonials")} />}
            {items.map((item) => (
              <tr key={item.id} className="border-b border-surface-border last:border-0">
                <Td>
                  <div className="flex items-center gap-2">
                    {(item.photoUrl || item.photoUrls?.[0]) && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.photoUrl || item.photoUrls?.[0]} alt="" className="w-8 h-8 rounded-full object-cover" />
                    )}
                    <span className="font-medium">{item.name}</span>
                  </div>
                </Td>
                <Td>{item.location ?? "—"}</Td>
                <Td><span className="text-amber-500">{renderStars(item.rating)}</span></Td>
                <Td>
                  <Badge variant={item.approved ? "success" : "warning"} dot>
                    {item.approved ? t("approved") : t("pending")}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => toggleApproval(item)}>
                      {item.approved ? t("reject") : t("approve")}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditing(item)}>
                      {t("edit")}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>
                      {t("remove")}
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <SlideOver
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id === 0 ? t("newTestimonial") : t("editTestimonial")}
      >
        {editing && (
          <div className="space-y-4">
            <Input
              label={t("name")}
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              required
            />
            <Input
              label={t("location")}
              value={editing.location ?? ""}
              onChange={(e) => setEditing({ ...editing, location: e.target.value })}
              placeholder="City, State"
            />
            <Textarea
              label={t("reviewText")}
              value={editing.text}
              onChange={(e) => setEditing({ ...editing, text: e.target.value })}
              rows={5}
              required
            />
            <Input
              label={t("rating")}
              type="number"
              value={String(editing.rating)}
              onChange={(e) => setEditing({ ...editing, rating: Math.min(5, Math.max(1, Number(e.target.value))) })}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t("uploadImage")} (avatar)
              </label>
              <FileUpload
                folder="testimonials"
                onUpload={(url) => setEditing({ ...editing, photoUrl: url })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Service photos (multiple)
              </label>
              <MultiFileUpload
                folder="testimonials"
                maxFiles={20}
                onUpload={(urls) => {
                  const merged = Array.from(new Set([...(editing.photoUrls || []), ...urls]));
                  setEditing({ ...editing, photoUrls: merged });
                }}
              />
            </div>
            <Input
              label="Photo URL"
              value={editing.photoUrl ?? ""}
              onChange={(e) => setEditing({ ...editing, photoUrl: e.target.value || null })}
              placeholder="https://example.com/photo.jpg"
            />
            <Textarea
              label="Service photo URLs (one per line)"
              value={(editing.photoUrls || []).join("\n")}
              onChange={(e) => {
                const urls = e.target.value
                  .split("\n")
                  .map((value) => value.trim())
                  .filter(Boolean);
                setEditing({ ...editing, photoUrls: Array.from(new Set(urls)) });
              }}
              rows={4}
              placeholder="/api/site/storage/testimonials/photo1.jpg"
            />
            {editing.photoUrl && (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={editing.photoUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-surface-border" />
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, photoUrl: null })}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  {t("remove")}
                </button>
              </div>
            )}
            {editing.photoUrls.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Service photos preview</p>
                <div className="grid grid-cols-3 gap-2">
                  {editing.photoUrls.map((url, idx) => (
                    <div key={`${url}-${idx}`} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="Service" className="w-full h-20 rounded-md object-cover border border-surface-border" />
                      <button
                        type="button"
                        onClick={() =>
                          setEditing({
                            ...editing,
                            photoUrls: editing.photoUrls.filter((_, i) => i !== idx),
                          })
                        }
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editing.approved}
                onChange={(e) => setEditing({ ...editing, approved: e.target.checked })}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <label className="text-sm text-slate-700">{t("approved")}</label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button loading={loading} onClick={handleSave}>{t("save")}</Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>{t("cancel")}</Button>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
