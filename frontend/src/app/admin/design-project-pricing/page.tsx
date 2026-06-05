"use client";

import { useCallback, useEffect, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import {
  DEFAULT_DESIGN_PROJECT_PRICING_SETTINGS,
  normalizeDesignProjectPricingSettings,
  type DesignProjectPricingSettings,
} from "@/lib/design-project-pricing";

type FormState = Record<keyof DesignProjectPricingSettings, string>;

const inputClass =
  "w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors";
const labelClass = "block text-xs text-white/40 mb-1";

function toForm(settings: DesignProjectPricingSettings): FormState {
  return {
    areaMin: String(settings.areaMin),
    areaMax: String(settings.areaMax),
    mainDocumentationPerM2: String(settings.mainDocumentationPerM2),
    model3dFixed: String(settings.model3dFixed),
    constructivePerM2: String(settings.constructivePerM2),
    auditFixed: String(settings.auditFixed),
    engineeringPerM2: String(settings.engineeringPerM2),
  };
}

function fromForm(form: FormState): DesignProjectPricingSettings {
  return normalizeDesignProjectPricingSettings({
    areaMin: Number(form.areaMin),
    areaMax: Number(form.areaMax),
    mainDocumentationPerM2: Number(form.mainDocumentationPerM2),
    model3dFixed: Number(form.model3dFixed),
    constructivePerM2: Number(form.constructivePerM2),
    auditFixed: Number(form.auditFixed),
    engineeringPerM2: Number(form.engineeringPerM2),
  });
}

export default function AdminDesignProjectPricingPage() {
  const [form, setForm] = useState<FormState>(() => toForm(DEFAULT_DESIGN_PROJECT_PRICING_SETTINGS));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetch("/api/admin/design-project-pricing")
      .then((r) => r.json())
      .then((data) => setForm(toForm(normalizeDesignProjectPricingSettings(data))))
      .catch(() => setError("Не удалось загрузить настройки."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function setField(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage("");
  }

  async function save() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/design-project-pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fromForm(form)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "save failed");
      setForm(toForm(normalizeDesignProjectPricingSettings(data)));
      setMessage("Сохранено. Цены применятся на сайте после обновления данных.");
    } catch {
      setError("Ошибка сохранения.");
    } finally {
      setSaving(false);
    }
  }

  async function resetDefaults() {
    if (!confirm("Сбросить настройки калькулятора проектирования к значениям по умолчанию?")) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/design-project-pricing", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "reset failed");
      setForm(toForm(normalizeDesignProjectPricingSettings(data)));
      setMessage("Настройки сброшены к значениям по умолчанию.");
    } catch {
      setError("Ошибка сброса.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-12 text-center text-white/30">Загрузка...</div>;

  return (
    <div className="max-w-4xl space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Калькулятор проектирования</h1>
          <p className="mt-1 text-sm text-white/40">
            Цены для блока на странице /services/proektirovanie.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetDefaults}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/70 hover:bg-white/[0.05] disabled:opacity-50"
          >
            <RotateCcw size={16} /> Сбросить
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F3D2E] px-4 py-2.5 text-sm font-semibold text-[#F6F6F4] hover:bg-[#174d3b] disabled:opacity-50"
          >
            <Save size={16} /> {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold text-white/80">Диапазон площади</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Минимальная площадь, м²</label>
            <input type="number" min={1} className={inputClass} value={form.areaMin} onChange={(e) => setField("areaMin", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Максимальная площадь, м²</label>
            <input type="number" min={1} className={inputClass} value={form.areaMax} onChange={(e) => setField("areaMax", e.target.value)} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold text-white/80">Основная документация</h2>
        <div className="mt-4">
          <label className={labelClass}>Цена основной документации, ₽/м²</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={form.mainDocumentationPerM2}
            onChange={(e) => setField("mainDocumentationPerM2", e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold text-white/80">Дополнительная документация</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>3D-моделирование, фикс. ₽</label>
            <input type="number" min={0} className={inputClass} value={form.model3dFixed} onChange={(e) => setField("model3dFixed", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Конструктивный проект, ₽/м²</label>
            <input type="number" min={0} className={inputClass} value={form.constructivePerM2} onChange={(e) => setField("constructivePerM2", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Аудит участка, фикс. ₽</label>
            <input type="number" min={0} className={inputClass} value={form.auditFixed} onChange={(e) => setField("auditFixed", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Проект инженерных систем, ₽/м²</label>
            <input type="number" min={0} className={inputClass} value={form.engineeringPerM2} onChange={(e) => setField("engineeringPerM2", e.target.value)} />
          </div>
        </div>
      </section>
    </div>
  );
}
