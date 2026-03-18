"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardFooter } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

type TabId = "company" | "social" | "notifications";

interface SettingsFormProps {
  initial: Record<string, string | null>;
}

/** Tabbed settings form for global site configuration */
export function SettingsForm({ initial }: SettingsFormProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabId>("company");

  const TABS: { id: TabId; label: string }[] = [
    { id: "company", label: t("tabCompany") },
    { id: "social", label: t("tabSocial") },
    { id: "notifications", label: t("tabNotifications") },
  ];

  const FIELD_GROUPS: Record<TabId, { key: string; label: string; type?: string; placeholder?: string }[]> = {
    company: [
      { key: "company_name", label: t("companyName"), placeholder: "Innexar LLC" },
      { key: "company_email", label: t("publicEmail"), type: "email", placeholder: "contact@innexar.com" },
      { key: "company_phone", label: t("phoneLabel"), placeholder: "+1 (555) 123-4567" },
      { key: "company_address", label: t("address"), placeholder: "123 Main St, City, State" },
      { key: "about_service_areas", label: "About: Service Areas (comma-separated)", placeholder: "Ocoee, Orlando, Winter Garden, Windermere" },
    ],
    social: [
      { key: "social_facebook", label: "Facebook URL", placeholder: "https://facebook.com/innexar" },
      { key: "social_instagram", label: "Instagram URL", placeholder: "https://instagram.com/innexar" },
      { key: "social_youtube", label: "YouTube URL", placeholder: "https://youtube.com/@innexar" },
      { key: "social_linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/company/innexar" },
    ],
    notifications: [
      { key: "notification_email", label: t("notificationEmail"), type: "email", placeholder: "alerts@innexar.com" },
      { key: "cta_primary_text", label: t("ctaText"), placeholder: "Get a Free Quote" },
      { key: "cta_primary_url", label: t("ctaUrl"), placeholder: "/contact" },
    ],
  };

  const [values, setValues] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    Object.values(FIELD_GROUPS).flat().forEach((f) => {
      o[f.key] = initial[f.key] ?? "";
    });
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
      Object.values(FIELD_GROUPS).flat().forEach((f) => {
        body[f.key] = values[f.key]?.trim() || null;
      });
      const res = await fetch("/api/admin/settings", {
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

  const fields = FIELD_GROUPS[activeTab];

  return (
    <div className="space-y-6">
      <PageHeader title={t("settings")} description={t("settingsDesc")} />
      <form onSubmit={handleSubmit}>
        <Card>
          <div className="border-b border-surface-border">
            <nav className="flex gap-0 px-5" role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-4 py-3 text-sm font-medium transition-colors
                    ${activeTab === tab.id
                      ? "text-brand-600"
                      : "text-slate-500 hover:text-slate-700"
                    }
                  `.trim()}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                  )}
                </button>
              ))}
            </nav>
          </div>
          <CardBody className="space-y-5 max-w-xl">
            {fields.map(({ key, label, type, placeholder }) => (
              <Input
                key={key}
                label={label}
                type={type ?? "text"}
                value={values[key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                placeholder={placeholder}
              />
            ))}
          </CardBody>
          <CardFooter className="flex items-center justify-between">
            <div>
              {message && (
                <p className={`text-sm animate-slide-up ${message.ok ? "text-emerald-600" : "text-red-600"}`}>
                  {message.text}
                </p>
              )}
            </div>
            <Button type="submit" loading={saving}>
              {t("saveChanges")}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
