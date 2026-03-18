"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

/** Client header for blog edit page with i18n */
export function BlogEditHeader() {
  const { t } = useI18n();
  return (
    <PageHeader
      title={t("editPost")}
      actions={
        <Link href="/admin/blog">
          <Button variant="ghost" size="sm">&larr; {t("backToBlog")}</Button>
        </Link>
      }
    />
  );
}
