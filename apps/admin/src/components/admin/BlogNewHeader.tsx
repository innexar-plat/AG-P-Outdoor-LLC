"use client";

import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";

/** Client header for new blog post page with i18n */
export function BlogNewHeader() {
  const { t } = useI18n();
  return <PageHeader title={t("newPost")} />;
}
