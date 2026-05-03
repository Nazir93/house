"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

interface Row {
  id: string;
  contractNumber: string;
  title: string;
  clientName: string | null;
  overallProgress: number;
  updatedAt: string;
}

export default function AdminClientProjectsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setError("");
    fetch(`/api/admin/client-projects${search ? `?search=${encodeURIComponent(search)}` : ""}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) {
          setError(data?.error || "Не удалось загрузить");
          setRows([]);
        } else {
          setRows(data);
        }
      })
      .catch(() => setError("Сервер недоступен"))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Клиенты (личный кабинет)</h1>
          <p className="text-sm text-white/40 mt-1">Договоры, пароли, этапы и медиа для кабинета клиента.</p>
        </div>
        <Link
          href="/admin/client-projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#143f32] text-white text-sm font-semibold"
        >
          <Plus size={16} /> Добавить
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          value={search}
          onChange={(e) => { setLoading(true); setSearch(e.target.value); }}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm"
          placeholder="Поиск по договору, названию..."
        />
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {loading ? <p className="text-white/40 text-sm">Загрузка…</p> : null}

      {!loading && rows.length === 0 && !error ? (
        <p className="text-white/40">Нет объектов.</p>
      ) : null}

      <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/[0.03] text-white/50 text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Договор</th>
              <th className="px-4 py-3">Объект</th>
              <th className="px-4 py-3">Клиент</th>
              <th className="px-4 py-3">%</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-mono text-xs">{r.contractNumber}</td>
                <td className="px-4 py-3">{r.title}</td>
                <td className="px-4 py-3 text-white/60">{r.clientName || "—"}</td>
                <td className="px-4 py-3 tabular-nums">{r.overallProgress}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/client-projects/${r.id}`} className="text-emerald-400 font-medium">
                    Изменить
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
