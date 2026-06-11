"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminSelect } from "@/components/admin/admin-select";
import {
  LEAD_SOURCE_FILTERS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_OPTIONS,
  LEAD_STATUS_STYLES,
} from "@/lib/lead-admin-ui";
import { getLeadSourceLabel } from "@/lib/lead-sources";

type Lead = {
  id: string;
  name: string;
  phone: string;
  source: string | null;
  status: string;
  createdAt: string;
};

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

  const activeSourceLabel = LEAD_SOURCE_FILTERS.find((f) => f.value === sourceFromUrl)?.label;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Заявки</h1>
        <p className="text-sm text-white/40 mt-1">
          {total > 0 ? `Всего: ${total}` : "Входящие обращения с форм сайта"}
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Имя, телефон или email"
            className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#0F3D2E]/50 transition-colors"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
        <AdminSelect
          value={sourceFromUrl}
          onValueChange={setSourceFilter}
          options={LEAD_SOURCE_FILTERS.map((f) => ({ value: f.value, label: f.label }))}
          className="w-full lg:w-52"
          placeholder="Форма"
        />
        <AdminSelect
          value={status}
          onValueChange={setStatus}
          options={LEAD_STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
          className="w-full lg:w-44"
          placeholder="Статус"
        />
      </div>

      {activeSourceLabel && sourceFromUrl ? (
        <p className="text-xs text-white/35">
          Фильтр: {activeSourceLabel}
          <button type="button" onClick={() => setSourceFilter("")} className="ml-2 text-emerald-400/80 hover:text-emerald-300">
            Сбросить
          </button>
        </p>
      ) : null}

      {error ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      ) : null}

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
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium">Клиент</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium hidden sm:table-cell">Источник</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium">Статус</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-white/30 font-medium hidden md:table-cell">Дата</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="block text-white hover:text-emerald-300 font-medium transition-colors"
                      >
                        {lead.name}
                      </Link>
                      <p className="text-white/45 text-xs mt-0.5">{lead.phone}</p>
                      <p className="text-white/35 text-xs mt-1 sm:hidden">{getLeadSourceLabel(lead.source)}</p>
                    </td>
                    <td className="px-4 py-3 text-white/45 hidden sm:table-cell">{getLeadSourceLabel(lead.source)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium ${LEAD_STATUS_STYLES[lead.status] || ""}`}>
                        {LEAD_STATUS_LABELS[lead.status] || lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/40 hidden md:table-cell whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
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
            type="button"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
            className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
