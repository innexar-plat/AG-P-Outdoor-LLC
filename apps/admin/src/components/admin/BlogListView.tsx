"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Td, TableEmpty } from "@/components/ui/Table";

type Post = { id: number; title: string; slug: string; status: string };

/** Client-side blog list view with i18n */
export function BlogListView({ posts }: { posts: Post[] }) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("blog")}
        description={t("blogDesc")}
        actions={
          <Link href="/admin/blog/new">
            <Button>{t("newPost")}</Button>
          </Link>
        }
      />
      <Table>
        <Thead>
          <tr>
            <Th>{t("title")}</Th>
            <Th>{t("slug")}</Th>
            <Th>{t("status")}</Th>
            <Th>{t("actions")}</Th>
          </tr>
        </Thead>
        <tbody>
          {posts.length === 0 ? (
            <TableEmpty colSpan={4} message={t("noPosts")} />
          ) : (
            posts.map((p) => (
              <tr key={p.id} className="border-t border-surface-border hover:bg-surface-muted transition-colors">
                <Td className="font-medium text-slate-900">{p.title}</Td>
                <Td className="font-mono text-xs text-slate-500">{p.slug}</Td>
                <Td>
                  {p.status === "published"
                    ? <Badge variant="success">{t("published")}</Badge>
                    : <Badge variant="default">{t("draft")}</Badge>
                  }
                </Td>
                <Td>
                  <Link href={`/admin/blog/${p.id}`}>
                    <Button variant="ghost" size="sm">{t("edit")}</Button>
                  </Link>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
