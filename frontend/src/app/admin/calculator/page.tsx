"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Save } from "lucide-react";

type AdminCalcPayload = {
  categories: Array<{
    id: string;
    labelRu: string;
    facadeCoef: number;
    perimeterCoef: number;
    roofCoef: number;
    shellPrices: { wallMaterial: string; pricePerM2: number }[];
  }>;
  facades: Array<{ id: string; slug: string; name: string; pricePerM2: number }>;
  options: Array<{ id: string; slug: string; name: string; groupSlug: string; pricePerUnit: number }>;
  settings: {
    smallAreaThresholdM2: number;
    smallAreaSurcharge: number;
    blindAreaWidthM: number;
  } | null;
};

export default function AdminCalculatorPage() {
  const [data, setData] = useState<AdminCalcPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkPercent, setBulkPercent] = useState("5");
  const [bulkGroup, setBulkGroup] = useState("construction");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/calculator");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "load failed");
      setData(json);
    } catch {
      setMessage("Не удалось загрузить калькулятор");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function runBulk() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk_update",
          percent: Number(bulkPercent),
          groupSlug: bulkGroup,
        }),
      });
      if (!res.ok) throw new Error();
      setMessage(`Цены группы «${bulkGroup}» обновлены на ${bulkPercent}%`);
      await load();
    } catch {
      setMessage("Ошибка массового обновления");
    } finally {
      setSaving(false);
    }
  }

  async function reseed() {
    setSaving(true);
    try {
      await fetch("/api/admin/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      await load();
      setMessage("Справочник перезалит из ТЗ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-white/40">Загрузка калькулятора…</div>;
  }

  if (!data) {
    return <div className="p-12 text-center text-red-400">{message || "Нет данных"}</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Калькулятор проектов</h1>
        </div>
        <button
          type="button"
          onClick={() => void reseed()}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Перезалить из ТЗ
        </button>
      </div>

      {message ? <p className="text-sm text-emerald-400">{message}</p> : null}

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">Массовое изменение цен</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <label className="space-y-1">
            <span className="text-xs text-white/40">Группа</span>
            <select
              value={bulkGroup}
              onChange={(e) => setBulkGroup(e.target.value)}
              className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
            >
              <option value="construction">Стройопции</option>
              <option value="engineering">Инженерия</option>
              <option value="facade">Фасады</option>
              <option value="shell">Коробка</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-white/40">Изменение, %</span>
            <input
              type="number"
              value={bulkPercent}
              onChange={(e) => setBulkPercent(e.target.value)}
              className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={() => void runBulk()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F3D2E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Save size={16} />
            Применить
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">Настройки</h2>
        {data.settings ? (
          <dl className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-white/40">Порог м²</dt>
              <dd>{data.settings.smallAreaThresholdM2}</dd>
            </div>
            <div>
              <dt className="text-white/40">Надбавка коробки</dt>
              <dd>{Math.round(data.settings.smallAreaSurcharge * 100)}%</dd>
            </div>
            <div>
              <dt className="text-white/40">Ширина отмостки, м</dt>
              <dd>{data.settings.blindAreaWidthM}</dd>
            </div>
          </dl>
        ) : null}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 overflow-x-auto">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-4">Категории и коэффициенты</h2>
        <table className="w-full text-sm text-left">
          <thead className="text-white/40 text-xs uppercase">
            <tr>
              <th className="py-2 pr-4">Код</th>
              <th className="py-2 pr-4">Кровля coef</th>
              <th className="py-2 pr-4">Фасад coef</th>
              <th className="py-2">Газобетон ₽/м²</th>
            </tr>
          </thead>
          <tbody>
            {data.categories.map((c) => (
              <tr key={c.id} className="border-t border-white/5">
                <td className="py-2 pr-4 font-mono">{c.id}</td>
                <td className="py-2 pr-4">{c.roofCoef}</td>
                <td className="py-2 pr-4">{c.facadeCoef}</td>
                <td className="py-2">{c.shellPrices.find((p) => p.wallMaterial === "gas")?.pricePerM2 ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-3">Фасады</h2>
        <ul className="text-sm space-y-1">
          {data.facades.map((f) => (
            <li key={f.id}>
              {f.name}: {f.pricePerM2.toLocaleString("ru-RU")} ₽/м²
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 max-h-96 overflow-auto">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-3">Опции</h2>
        <ul className="text-sm space-y-1">
          {data.options.map((o) => (
            <li key={o.id}>
              <span className="text-white/40">{o.groupSlug}</span> — {o.name}: {o.pricePerUnit.toLocaleString("ru-RU")}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
