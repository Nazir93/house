"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { LEAD_SOURCE_OPTIONS, getLeadSourceLabel } from "@/lib/lead-sources";

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  service: string | null;
  source: string | null;
  status: string;
  createdAt: string;
};

const STATUSES = [
  { value: "ALL", label: "Все" },
  { value: "NEW", label: "Новые" },
  { value: "IN_PROGRESS", label: "В работе" },
  { value: "DONE", label: "Завершённые" },
  { value: "CANCELLED", label: "Отменённые" },
];

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-500/20 text-blue-400",
  IN_PROGRESS: "bg-[#0F3D2E]/25 text-emerald-300",
  DONE: "bg-green-500/20 text-green-400",
  CANCELLED: "bg-red-500/20 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  DONE: "Завершена",
  CANCELLED: "Отменена",
};

const SOURCE_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Все формы" },
  ...LEAD_SOURCE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
];

export function AdminLeadsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sourceFromUrl = searchParams.get("source") ?? "";

  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const setSourceFilter = useCallback(
    (next: string) => {
      const p = new URLSearchParams(searchParams.toString());
      if (next) p.set("source", next);
      else p.delete("source");
      const q = p.toString();
      router.replace(q ? `${pathname}?${q}` : pathname);
      setPage(1);
    },
    [pathname, router, searchParams]
  );

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      if (status !== "ALL") params.set("status", status);
      if (search) params.set("search", search);
      if (sourceFromUrl) params.set("source", sourceFromUrl);

      const res = await fetch(`/api/admin/leads?${params}`);
      if (!res.ok) throw new Error("Ошибка загрузки");

      const data = await res.json();
      setLeads(data.leads);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setError("Не удалось загрузить заявки. Проверьте подключение к БД.");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [page, status, search, sourceFromUrl]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    setPage(1);
  }, [status, search, sourceFromUrl]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Заявки</h1>
        <p className="text-sm text-white/40 mt-1">
          {total > 0 ? `Всего: ${total}` : "Управление входящими заявками"}
        </p>
      </div>

      {/* Source — отдельный ряд: «разделы» по формам */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] uppercase tracking-wider text-white/30">Форма / источник</span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
          {SOURCE_FILTER_OPTIONS.map((s) => (
            <button
              key={s.value || "all"}
              type="button"
              onClick={() => setSourceFilter(s.value)}
              title={LEAD_SOURCE_OPTIONS.find((o) => o.value === s.value)?.hint}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                sourceFromUrl === s.value
                  ? "bg-[#0F3D2E]/20 text-emerald-300 border border-[#0F3D2E]/35"
                  : "bg-white/[0.05] text-white/50 border border-white/[0.08] hover:text-white/70"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени, телефону, email..."
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                status === s.value
                  ? "bg-[#0F3D2E]/20 text-emerald-300 border border-[#0F3D2E]/35"
                  : "bg-white/[0.05] text-white/50 border border-white/[0.08] hover:text-white/70"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/30 text-sm">Загрузка...</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox size={32} className="mx-auto text-white/15 mb-3" />
            <p className="text-white/30 text-sm">Заявок не найдено</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium">Имя</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium">Телефон</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium hidden md:table-cell">Услуга</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium hidden lg:table-cell">Источник</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium">Статус</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium hidden sm:table-cell">Дата</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/leads/${lead.id}`} className="text-white hover:text-emerald-300 font-medium transition-colors">
                        {lead.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-white/60">{lead.phone}</td>
                    <td className="px-4 py-3 text-white/40 hidden md:table-cell">{lead.service || "—"}</td>
                    <td className="px-4 py-3 text-white/40 hidden lg:table-cell">{getLeadSourceLabel(lead.source)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium ${STATUS_STYLES[lead.status] || ""}`}>
                        {STATUS_LABELS[lead.status] || lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/40 hidden sm:table-cell">
                      {new Date(lead.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-white/40 px-3">
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
            className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
