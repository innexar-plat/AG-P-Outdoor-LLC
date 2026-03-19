"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardFooter } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

const PIXEL_FIELDS = [
  { key: "meta_pixel_id", label: "Meta Pixel ID (Facebook/Instagram)", placeholder: "123456789012345" },
  { key: "google_ads_id", label: "Google Ads ID", placeholder: "AW-XXXXXXXXX" },
  { key: "gtm_id", label: "Google Tag Manager (GTM)", placeholder: "GTM-XXXXXXX" },
  { key: "ga4_id", label: "GA4 Measurement ID", placeholder: "G-XXXXXXXXXX" },
  { key: "gsc_meta_tag", label: "Google Search Console — meta tag", placeholder: 'content="..."' },
] as const;

interface PixelsFormProps {
  initial: Record<string, string | null>;
}

/** Form for managing tracking pixels and custom scripts */
export function PixelsForm({ initial }: PixelsFormProps) {
  const { t } = useI18n();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    PIXEL_FIELDS.forEach((f) => { o[f.key] = initial[f.key] ?? ""; });
    o.custom_scripts_head = initial.custom_scripts_head ?? "";
    o.custom_scripts_body = initial.custom_scripts_body ?? "";
    return o;
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const body: Record<string, string | null> = {};
      PIXEL_FIELDS.forEach((f) => { body[f.key] = values[f.key]?.trim() || null; });
      body.custom_scripts_head = values.custom_scripts_head?.trim() || null;
      body.custom_scripts_body = values.custom_scripts_body?.trim() || null;
      const res = await fetch("/admin/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage({ text: json.error ?? t("errorSaving"), ok: false });
        return;
      }
      setMessage({ text: t("savedSuccess"), ok: true });
    } catch {
      setMessage({ text: t("connectionError"), ok: false });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("pixelsSeo")} description={t("pixelsDesc")} />
      <form onSubmit={handleSubmit}>
        <Card>
          <CardBody className="space-y-5 max-w-2xl">
            {PIXEL_FIELDS.map(({ key, label, placeholder }) => (
              <Input
                key={key}
                label={label}
                value={values[key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                placeholder={placeholder}
                className="font-mono text-xs"
              />
            ))}
            <Textarea
              label={t("customScriptsHead")}
              value={values.custom_scripts_head ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, custom_scripts_head: e.target.value }))}
              rows={4}
              className="font-mono text-xs"
              placeholder="<script>...</script>"
            />
            <Textarea
              label={t("customScriptsBody")}
              value={values.custom_scripts_body ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, custom_scripts_body: e.target.value }))}
              rows={4}
              className="font-mono text-xs"
              placeholder="<script>...</script>"
            />
          </CardBody>
          <CardFooter className="flex items-center justify-between">
            <div>
              {message && (
                <p className={`text-sm animate-slide-up ${message.ok ? "text-emerald-600" : "text-red-600"}`}>
                  {message.text}
                </p>
              )}
            </div>
            <Button type="submit" loading={saving}>{t("save")}</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
