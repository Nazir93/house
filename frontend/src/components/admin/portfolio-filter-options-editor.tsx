"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Save } from "lucide-react";
import { AdminSelect } from "@/components/admin/admin-select";
import {
  DEFAULT_PORTFOLIO_FLOOR_FILTER_OPTIONS,
  DEFAULT_PORTFOLIO_MATERIAL_FILTER_OPTIONS,
  type PortfolioFilterOptionsConfig,
} from "@/lib/portfolio-filter-options";

const MATERIAL_ENUM_OPTIONS = [
  { value: "BRICK", label: "Кирпич (BRICK)" },
  { value: "GAS_BLOCK", label: "Газобетон (GAS_BLOCK)" },
  { value: "CERAMIC_BLOCK", label: "Керамический блок (CERAMIC_BLOCK)" },
  { value: "FRAME", label: "Каркас (FRAME)" },
  { value: "OTHER", label: "Другое (OTHER)" },
];

const inp =
  "min-w-0 flex-1 rounded-lg border border-white/[0.12] bg-white/[0.06] px-2.5 py-2 text-sm text-white placeholder:text-white/30";

export function PortfolioFilterOptionsEditor() {
  const [config, setConfig] = useState<PortfolioFilterOptionsConfig>({ customMaterials: [], customFloors: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [matValue, setMatValue] = useState("FRAME");
  const [matLabel, setMatLabel] = useState("");
  const [floorLabel, setFloorLabel] = useState("");
  const [floorNum, setFloorNum] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/portfolio-filter-options");
      const data = await res.json();
      if (res.ok) setConfig(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/portfolio-filter-options", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) setMsg("Не удалось сохранить");
      else setMsg("Сохранено");
    } finally {
      setSaving(false);
    }
  }

  function addMaterial() {
    const label = matLabel.trim();
    if (!label) return;
    setConfig((c) => ({
      ...c,
      customMaterials: [...c.customMaterials, { value: matValue, label }],
    }));
    setMatLabel("");
  }

  function addFloor() {
    const label = floorLabel.trim();
    const floors = Number(floorNum.replace(",", "."));
    if (!label || !Number.isFinite(floors)) return;
    const id = `custom-${String(floors).replace(".", "_")}-${Date.now()}`;
    setConfig((c) => ({
      ...c,
      customFloors: [...c.customFloors, { id, label, floors }],
    }));
    setFloorLabel("");
    setFloorNum("");
  }

  if (loading) return <p className="text-sm text-white/40">Загрузка…</p>;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-white">Фильтры на странице «Портфолио»</h2>
        <p className="mt-1 text-xs text-white/45">
          Пресеты по умолчанию: {DEFAULT_PORTFOLIO_MATERIAL_FILTER_OPTIONS.map((m) => m.label).join(", ")}; этажность:{" "}
          {DEFAULT_PORTFOLIO_FLOOR_FILTER_OPTIONS.map((f) => f.label).join(", ")}. Ниже — дополнительные варианты.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-wider text-white/40">Доп. материалы</p>
        <ul className="text-xs text-white/60 space-y-1">
          {config.customMaterials.length === 0 ? <li>—</li> : null}
          {config.customMaterials.map((m) => (
            <li key={`${m.value}-${m.label}`}>
              {m.label} <span className="text-white/30">({m.value})</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <AdminSelect value={matValue} onValueChange={setMatValue} options={MATERIAL_ENUM_OPTIONS} className="w-48" />
          <input className={inp} value={matLabel} onChange={(e) => setMatLabel(e.target.value)} placeholder="Подпись в фильтре" />
          <button type="button" onClick={addMaterial} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs text-white">
            <Plus size={14} /> Добавить
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-wider text-white/40">Доп. этажность</p>
        <ul className="text-xs text-white/60 space-y-1">
          {config.customFloors.length === 0 ? <li>—</li> : null}
          {config.customFloors.map((f) => (
            <li key={f.id}>
              {f.label} <span className="text-white/30">({f.floors})</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <input className={inp} value={floorLabel} onChange={(e) => setFloorLabel(e.target.value)} placeholder="Подпись" />
          <input className="w-24 rounded-lg border border-white/[0.12] bg-white/[0.06] px-2.5 py-2 text-sm text-white" value={floorNum} onChange={(e) => setFloorNum(e.target.value)} placeholder="1.5" />
          <button type="button" onClick={addFloor} className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs text-white">
            <Plus size={14} /> Добавить
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0F3D2E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
        {msg ? <span className="text-xs text-emerald-400">{msg}</span> : null}
      </div>
    </div>
  );
}
