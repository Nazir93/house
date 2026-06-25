"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Save, Trash2 } from "lucide-react";
import { LEAD_STATUS_BUTTON_STYLES, LEAD_STATUS_LABELS } from "@/lib/lead-admin-ui";
import { getLeadSourceLabel } from "@/lib/lead-sources";
import { houseConstructionCalcDisplayRows } from "@/lib/house-construction-calc-display";

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string | null;
  pageUrl: string | null;
  source: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  yclid: string | null;
  calcData: unknown;
  status: string;
  proposalStatus?: "NONE" | "PENDING" | "READY" | "FAILED" | "UNSUPPORTED";
  proposalPath?: string | null;
  proposalFilename?: string | null;
  proposalError?: string | null;
  notes: string | null;
  createdAt: string;
};

const EDITABLE_STATUSES = [
  { value: "NEW", label: "Новая" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "DONE", label: "Завершена" },
  { value: "CANCELLED", label: "Отменена" },
];

function pageHref(pageUrl: string): string | null {
  const trimmed = pageUrl.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return null;
}

function LeadCalcSummary({ calcData }: { calcData: unknown }) {
  const rows = houseConstructionCalcDisplayRows(calcData);

  if (!rows?.length) return null;

  return (
    <div className="space-y-2 pt-3 border-t border-white/[0.06]">
      <p className="text-[11px] uppercase tracking-wider text-white/35">Данные калькулятора</p>
      <dl className="space-y-3">
        {rows.map((r) => (
          <div
            key={r.label}
            className={r.items?.length ? "space-y-2" : "grid grid-cols-[minmax(0,9rem)_1fr] gap-3 text-sm"}
          >
            <dt className="text-white/40">{r.label}</dt>
            <dd className={r.items?.length ? "space-y-1" : "text-white/85"}>
              {r.items?.length ? (
                <ul className="space-y-1.5">
                  {r.items.map((item) => (
                    <li key={`${r.label}-${item.label}`} className="flex justify-between gap-3 text-sm">
                      <span className="min-w-0 text-white/70">{item.label}</span>
                      <span className="shrink-0 tabular-nums text-white/85">{item.amountRub.toLocaleString("ru-RU")} ₽</span>
                    </li>
                  ))}
                </ul>
              ) : (
                r.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function AdminLeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/leads/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError("Заявка не найдена");
        } else {
          setLead(data);
          setNotes(data.notes || "");
          setStatus(data.status);
        }
      })
      .catch(() => setError("Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/leads/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        const updated = await res.json();
        setLead(updated);
      } else {
        setError("Ошибка сохранения");
      }
    } catch {
      setError("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Удалить заявку? Это действие необратимо.")) return;
    try {
      await fetch(`/api/admin/leads/${params.id}`, { method: "DELETE" });
      router.push("/admin/leads");
    } catch {
      setError("Ошибка удаления");
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-white/30">Загрузка...</div>;
  }

  if (error && !lead) {
    return (
      <div className="space-y-4">
        <Link href="/admin/leads" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft size={16} /> Назад к заявкам
        </Link>
        <div className="p-8 text-center rounded-2xl bg-red-500/5 border border-red-500/10 text-red-400">
          {error || "Заявка не найдена"}
        </div>
      </div>
    );
  }

  if (!lead) return null;

  const href = lead.pageUrl ? pageHref(lead.pageUrl) : null;
  const utmRows = [
    { label: "Source", value: lead.utmSource },
    { label: "Medium", value: lead.utmMedium },
    { label: "Campaign", value: lead.utmCampaign },
    { label: "Term", value: lead.utmTerm },
    { label: "Content", value: lead.utmContent },
    { label: "yclid", value: lead.yclid },
  ].filter((r) => r.value?.trim());

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/leads" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft size={16} /> Заявки
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Удалить"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{lead.name}</h1>
        <p className="mt-1 text-sm text-white/40">
          {new Date(lead.createdAt).toLocaleString("ru-RU")} · {getLeadSourceLabel(lead.source)}
        </p>
      </div>

      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
        <div className="space-y-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/35">Телефон</p>
            <a href={`tel:${lead.phone.replace(/\s/g, "")}`} className="text-sm text-emerald-300 hover:underline">
              {lead.phone}
            </a>
          </div>
          {lead.email ? (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/35">Email</p>
              <a href={`mailto:${lead.email}`} className="text-sm text-white/80 hover:underline">
                {lead.email}
              </a>
            </div>
          ) : null}
          {lead.service ? (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/35">Тема / услуга</p>
              <p className="text-sm text-white/80">{lead.service}</p>
            </div>
          ) : null}
          {lead.pageUrl ? (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/35">Страница</p>
              {href ? (
                <Link
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-1.5 text-sm text-emerald-300/90 hover:underline break-all"
                >
                  {lead.pageUrl}
                  <ExternalLink size={13} className="shrink-0 opacity-70" />
                </Link>
              ) : (
                <p className="text-sm text-white/80 break-all">{lead.pageUrl}</p>
              )}
            </div>
          ) : null}
        </div>

        {lead.calcData != null ? <LeadCalcSummary calcData={lead.calcData} /> : null}

        <div className="space-y-2 pt-3 border-t border-white/[0.06]">
          <p className="text-[11px] uppercase tracking-wider text-white/35">Коммерческое предложение (PDF)</p>
          {lead.proposalStatus === "READY" ? (
            <a
              href={`/api/leads/proposal?leadId=${encodeURIComponent(lead.id)}`}
              className="inline-flex items-center gap-1.5 text-sm text-emerald-300/90 hover:underline"
            >
              Скачать PDF
              <ExternalLink size={13} className="shrink-0 opacity-70" />
            </a>
          ) : (
            <p className="text-sm text-white/70">
              Статус: {lead.proposalStatus || "NONE"}
              {lead.proposalError ? ` · ${lead.proposalError}` : ""}
            </p>
          )}
        </div>

        {utmRows.length > 0 ? (
          <details className="pt-3 border-t border-white/[0.06]">
            <summary className="text-[11px] uppercase tracking-wider text-white/35 cursor-pointer hover:text-white/50">
              UTM-метки
            </summary>
            <dl className="mt-3 space-y-2">
              {utmRows.map((row) => (
                <div key={row.label} className="grid grid-cols-[minmax(0,6rem)_1fr] gap-3 text-sm">
                  <dt className="text-white/40">{row.label}</dt>
                  <dd className="text-white/75 break-all">{row.value}</dd>
                </div>
              ))}
            </dl>
          </details>
        ) : null}
      </div>

      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
        <div>
          <h2 className="text-[11px] uppercase tracking-wider text-white/35">Статус</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {EDITABLE_STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatus(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  status === s.value
                    ? LEAD_STATUS_BUTTON_STYLES[s.value]
                    : "border-white/[0.08] text-white/30 hover:text-white/50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          {status !== lead.status ? (
            <p className="mt-2 text-xs text-white/35">
              Сейчас в базе: {LEAD_STATUS_LABELS[lead.status] || lead.status}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="lead-notes" className="text-[11px] uppercase tracking-wider text-white/35">
            Заметки
          </label>
          <textarea
            id="lead-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="mt-2 w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
            placeholder="Комментарий менеджера..."
          />
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] font-semibold text-sm transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </div>
    </div>
  );
}
