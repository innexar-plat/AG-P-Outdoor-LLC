"use client";

import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";

/** Client header for Forms page with i18n */
export function FormsPageHeader() {
  const { t } = useI18n();
  return <PageHeader title={t("forms")} description={t("formsDesc")} />;
}
