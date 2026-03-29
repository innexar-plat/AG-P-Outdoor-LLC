"use client";

import { useState, useCallback, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { Table, Thead, Th, Td, TableEmpty } from "@/components/ui/Table";
import { SlideOver } from "@/components/ui/SlideOver";
import { Textarea } from "@/components/ui/Textarea";
import { formatDate } from "@/lib/format-date";

type Submission = {
  id: number;
  formType: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  metadata: string | null;
  read: boolean;
  leadStatus: "new" | "called" | "not_called";
  crmComment: string | null;
  createdAt: Date | string;
};

interface FormsListProps {
  initial: Submission[];
}

/** Filterable list of form submissions with slide-over detail */
export function FormsList({ initial }: FormsListProps) {
  const { t } = useI18n();
  const [items, setItems] = useState(initial);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [filters, setFilters] = useState({ formType: "", read: "", leadStatus: "", from: "", to: "" });
  const [leadDraft, setLeadDraft] = useState<{ leadStatus: Submission["leadStatus"]; crmComment: string }>({
    leadStatus: "new",
    crmComment: "",
  });

  const fetchList = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "100");
    if (filters.formType) params.set("form_type", filters.formType);
    if (filters.read !== "") params.set("read", filters.read);
    if (filters.leadStatus) params.set("lead_status", filters.leadStatus);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    const res = await fetch(`/admin/api/admin/forms?${params}`);
    const json = await res.json();
    if (res.ok && json.data) setItems(json.data);
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    const timer = setInterval(fetchList, 25_000);
    return () => clearInterval(timer);
  }, [fetchList]);

  useEffect(() => {
    if (!selectedId) return;
    const current = items.find((item) => item.id === selectedId);
    if (!current) return;
    setLeadDraft({
      leadStatus: current.leadStatus ?? "new",
      crmComment: current.crmComment ?? "",
    });
  }, [selectedId, items]);

  async function markRead(id: number) {
    const res = await fetch(`/admin/api/admin/forms/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((s) => (s.id === id ? { ...s, read: true } : s)));
      if (selectedId === id) setSelectedId(null);
    }
  }

  async function remove(id: number) {
    if (!confirm(t("confirmRemove"))) return;
    const res = await fetch(`/admin/api/admin/forms/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((s) => s.id !== id));
      if (selectedId === id) setSelectedId(null);
    }
  }

  async function saveLead(id: number) {
    setSavingLead(true);
    const res = await fetch(`/admin/api/admin/forms/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadStatus: leadDraft.leadStatus,
        crmComment: leadDraft.crmComment.trim() || null,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        setItems((prev) => prev.map((item) => (item.id === id ? json.data : item)));
      }
    }
    setSavingLead(false);
  }

  function renderLeadBadge(status: Submission["leadStatus"]) {
    if (status === "called") return <Badge variant="success">{t("called")}</Badge>;
    if (status === "not_called") return <Badge variant="danger">{t("notCalled")}</Badge>;
    return <Badge variant="warning">{t("newLead")}</Badge>;
  }

  const dateStr = (d: Date | string) =>
    typeof d === "string" ? d : formatDate(d);

  const selected = selectedId ? items.find((s) => s.id === selectedId) : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardBody>
          <div className="flex flex-wrap items-end gap-3">
            <Select
              label={t("type")}
              value={filters.formType}
              onChange={(e) => setFilters((f) => ({ ...f, formType: e.target.value }))}
              options={[
                { value: "", label: t("all") },
                { value: "contact", label: "Contact" },
                { value: "quote", label: "Quote" },
                { value: "callback", label: "Callback" },
              ]}
            />
            <Select
              label={t("read")}
              value={filters.read}
              onChange={(e) => setFilters((f) => ({ ...f, read: e.target.value }))}
              options={[
                { value: "", label: t("all") },
                { value: "true", label: t("yes") },
                { value: "false", label: t("no") },
              ]}
            />
            <Select
              label={t("leadClassification")}
              value={filters.leadStatus}
              onChange={(e) => setFilters((f) => ({ ...f, leadStatus: e.target.value }))}
              options={[
                { value: "", label: t("all") },
                { value: "new", label: t("newLead") },
                { value: "called", label: t("called") },
                { value: "not_called", label: t("notCalled") },
              ]}
            />
            <Input label={t("from")} type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
            <Input label={t("to")} type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
            <div className="flex gap-2 pb-0.5">
              <Button onClick={fetchList} loading={loading} size="sm">
                {loading ? t("filtering") : t("filter")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.open("/admin/api/admin/forms/export", "_blank")}>
                {t("exportCsv")}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Table>
        <Thead>
          <tr>
            <Th>{t("date")}</Th>
            <Th>{t("type")}</Th>
            <Th>{t("name")}</Th>
            <Th>{t("email")}</Th>
            <Th>{t("status")}</Th>
            <Th>{t("leadClassification")}</Th>
            <Th>{t("actions")}</Th>
          </tr>
        </Thead>
        <tbody>
          {items.length === 0 ? (
            <TableEmpty colSpan={7} message={t("noSubmissionsTable")} />
          ) : (
            items.map((s) => (
              <tr key={s.id} className="border-t border-surface-border cursor-pointer hover:bg-surface-muted transition-colors" onClick={() => setSelectedId(s.id)}>
                <Td className="text-slate-500 text-xs">{dateStr(s.createdAt)}</Td>
                <Td><Badge variant="info">{s.formType}</Badge></Td>
                <Td className="font-medium text-slate-900">{s.name}</Td>
                <Td>{s.email}</Td>
                <Td>
                  {s.read ? <Badge variant="default">{t("read")}</Badge> : <Badge variant="warning" dot>{t("newBadge")}</Badge>}
                </Td>
                <Td>{renderLeadBadge(s.leadStatus ?? "new")}</Td>
                <Td onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2">
                    {!s.read && <Button variant="ghost" size="sm" onClick={() => markRead(s.id)}>{t("markRead")}</Button>}
                    <Button variant="ghost" size="sm" onClick={() => remove(s.id)} className="text-red-600 hover:text-red-700">{t("remove")}</Button>
                  </div>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <SlideOver open={!!selected} onClose={() => setSelectedId(null)} title={`${t("submission")} #${selected?.id ?? ""}`}>
        {selected && (
          <div className="space-y-5">
            <dl className="space-y-4">
              <DetailRow label={t("date")} value={dateStr(selected.createdAt)} />
              <DetailRow label={t("type")} value={selected.formType} />
              <DetailRow label={t("name")} value={selected.name} />
              <DetailRow label={t("email")} value={selected.email} />
              {selected.phone && <DetailRow label={t("phone")} value={selected.phone} />}
              <div>
                <dt className="text-xs font-medium text-slate-500 mb-1">{t("leadClassification")}</dt>
                <dd>{renderLeadBadge(selected.leadStatus ?? "new")}</dd>
              </div>
              {selected.message && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 mb-1">{t("message")}</dt>
                  <dd className="text-sm text-slate-900 whitespace-pre-wrap bg-surface-muted rounded-lg p-3">{selected.message}</dd>
                </div>
              )}
              {selected.metadata && (
                <div>
                  <dt className="text-xs font-medium text-slate-500 mb-1">{t("metadata")}</dt>
                  <dd className="text-xs text-slate-600 break-all font-mono bg-surface-muted rounded-lg p-3">{selected.metadata}</dd>
                </div>
              )}
              <Select
                label={t("leadClassification")}
                value={leadDraft.leadStatus}
                onChange={(e) => setLeadDraft((prev) => ({ ...prev, leadStatus: e.target.value as Submission["leadStatus"] }))}
                options={[
                  { value: "new", label: t("newLead") },
                  { value: "called", label: t("called") },
                  { value: "not_called", label: t("notCalled") },
                ]}
              />
              <Textarea
                label={t("crmComment")}
                value={leadDraft.crmComment}
                onChange={(e) => setLeadDraft((prev) => ({ ...prev, crmComment: e.target.value }))}
                rows={5}
                placeholder={t("crmComment")}
              />
            </dl>
            <div className="flex gap-2 pt-2 border-t border-surface-border">
              {!selected.read && <Button size="sm" onClick={() => markRead(selected.id)}>{t("markRead")}</Button>}
              <Button size="sm" variant="secondary" loading={savingLead} onClick={() => saveLead(selected.id)}>{t("saveLead")}</Button>
              <Button variant="danger" size="sm" onClick={() => remove(selected.id)}>{t("remove")}</Button>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900 mt-0.5">{value}</dd>
    </div>
  );
}
