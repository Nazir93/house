"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { getLeadSourceLabel } from "@/lib/lead-sources";

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
  calcData: unknown;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUSES = [
  { value: "NEW", label: "Новая", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "IN_PROGRESS", label: "В работе", color: "bg-[#0F3D2E]/25 text-emerald-300 border-[#0F3D2E]/35" },
  { value: "DONE", label: "Завершена", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { value: "CANCELLED", label: "Отменена", color: "bg-red-500/20 text-red-400 border-red-500/30" },
];

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

  if (error || !lead) {
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

  const infoFields = [
    { label: "Имя", value: lead.name },
    { label: "Телефон", value: lead.phone },
    { label: "Email", value: lead.email },
    { label: "Услуга", value: lead.service },
    { label: "Страница", value: lead.pageUrl },
    { label: "Источник", value: getLeadSourceLabel(lead.source) },
    { label: "UTM Source", value: lead.utmSource },
    { label: "UTM Medium", value: lead.utmMedium },
    { label: "UTM Campaign", value: lead.utmCampaign },
    { label: "Дата", value: new Date(lead.createdAt).toLocaleString("ru-RU") },
  ].filter((f) => f.value);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link href="/admin/leads" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors">
          <ArrowLeft size={16} /> Заявки
        </Link>
        <button
          onClick={handleDelete}
          className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Удалить"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <h1 className="text-2xl font-bold">{lead.name}</h1>

      {/* Info */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-3">
        {infoFields.map((field) => (
          <div key={field.label} className="flex items-start gap-4">
            <span className="text-xs uppercase tracking-wider text-white/30 w-28 pt-0.5 flex-shrink-0">{field.label}</span>
            <span className="text-sm text-white/80">{field.value}</span>
          </div>
        ))}

        {lead.calcData != null && (
          <div>
            <span className="text-xs uppercase tracking-wider text-white/30">Данные калькулятора</span>
            <pre className="mt-1.5 text-xs text-white/50 bg-white/[0.03] rounded-lg p-3 overflow-x-auto">
              {String(JSON.stringify(lead.calcData, null, 2))}
            </pre>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Статус</h2>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                status === s.value ? s.color : "border-white/[0.08] text-white/30 hover:text-white/50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Заметки</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
          placeholder="Добавить заметку..."
        />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] font-semibold text-sm transition-colors disabled:opacity-50"
      >
        <Save size={16} />
        {saving ? "Сохранение..." : "Сохранить"}
      </button>
    </div>
  );
}
