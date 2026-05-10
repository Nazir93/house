"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, RotateCcw, Save, Trash2 } from "lucide-react";

import {
  DEFAULT_MORTGAGE_PAGE_SETTINGS,
  mortgagePageSettingsSchema,
  type MortgagePageSettings,
  type MortgageProgramRow,
} from "@/lib/mortgage-settings-schema";

function emptyProgram(idSuffix: string): MortgageProgramRow {
  return {
    id: `program_${idSuffix}`,
    title: "Новая программа",
    ratePercent: 10,
    rateLabel: "",
    maxLoanRub: 10_000_000,
    minDownPaymentPercent: 20,
    shortHint: "",
  };
}

export default function AdminMortgagePage() {
  const [data, setData] = useState<MortgagePageSettings>(DEFAULT_MORTGAGE_PAGE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetch("/api/admin/mortgage-settings")
      .then((r) => r.json())
      .then((d: MortgagePageSettings | { error?: string }) => {
        if (d && typeof d === "object" && "programs" in d && Array.isArray((d as MortgagePageSettings).programs)) {
          setData(d as MortgagePageSettings);
        } else {
          setError("Не удалось загрузить настройки");
        }
      })
      .catch(() => setError("Ошибка загрузки"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateField<K extends keyof MortgagePageSettings>(key: K, value: MortgagePageSettings[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function patchProgram(index: number, partial: Partial<MortgageProgramRow>) {
    setData((prev) => ({
      ...prev,
      programs: prev.programs.map((p, i) => (i === index ? { ...p, ...partial } : p)),
    }));
    setSaved(false);
  }

  function addProgram() {
    setData((prev) => ({
      ...prev,
      programs: [...prev.programs, emptyProgram(String(Date.now()))],
    }));
    setSaved(false);
  }

  function removeProgram(index: number) {
    setData((prev) => ({
      ...prev,
      programs: prev.programs.filter((_, i) => i !== index),
    }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    const validated = mortgagePageSettingsSchema.safeParse(data);
    if (!validated.success) {
      setError(JSON.stringify(validated.error.flatten(), null, 2));
      setSaving(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/mortgage-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated.data),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setError(typeof j.error === "string" ? j.error : "Ошибка сохранения");
        setSaving(false);
        return;
      }
      setData(validated.data);
      setSaved(true);
    } catch {
      setError("Сеть недоступна");
    }
    setSaving(false);
  }

  function resetToDefaults() {
    if (!confirm("Подставить в форму значения по умолчанию из кода? (сохраните отдельно, чтобы записать в БД.)")) return;
    setData({ ...DEFAULT_MORTGAGE_PAGE_SETTINGS });
    setSaved(false);
  }

  if (loading) {
    return <div className="p-12 text-center text-white/30">Загрузка...</div>;
  }

  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#0F3D2E]/50 transition-colors";
  const labelClass = "block text-xs text-white/40 mb-1";

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Страница «Ипотека»</h1>
          <p className="text-sm text-white/40 mt-1">
            Программы, калькулятор, блок доверия и сноски. Публичная страница: /mortgage
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetToDefaults}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm hover:bg-white/[0.05]"
          >
            <RotateCcw size={16} /> Дефолты в форму
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F3D2E] hover:bg-[#174d3b] text-[#F6F6F4] text-sm font-semibold disabled:opacity-50"
          >
            <Save size={16} /> {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-[11px] text-red-200 whitespace-pre-wrap font-mono">
          {error}
        </div>
      ) : null}
      {saved ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          Сохранено. Кэш страницы сброшен.
        </div>
      ) : null}

      <section className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white/80">Ипотечные программы</h2>
          <button
            type="button"
            onClick={addProgram}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <Plus size={14} /> Добавить
          </button>
        </div>
        <div className="space-y-6">
          {data.programs.map((p, i) => (
            <div key={`${p.id}-${i}`} className="rounded-xl border border-white/[0.06] p-4 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <span className="text-[11px] uppercase tracking-wider text-white/30">Программа {i + 1}</span>
                <button
                  type="button"
                  disabled={data.programs.length <= 1}
                  onClick={() => removeProgram(i)}
                  className="text-white/30 hover:text-red-400 disabled:opacity-30"
                  title="Удалить"
                  aria-label="Удалить программу"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className={labelClass}>ID (латиница, без пробелов)</label>
                  <input
                    className={inputClass}
                    value={p.id}
                    onChange={(e) => patchProgram(i, { id: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Название</label>
                  <input
                    className={inputClass}
                    value={p.title}
                    onChange={(e) => patchProgram(i, { title: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Ставка, %</label>
                  <input
                    type="number"
                    step={0.1}
                    className={inputClass}
                    value={p.ratePercent}
                    onChange={(e) => patchProgram(i, { ratePercent: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Подпись к ставке</label>
                  <input
                    className={inputClass}
                    value={p.rateLabel}
                    onChange={(e) => patchProgram(i, { rateLabel: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Макс. сумма кредита, ₽</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={p.maxLoanRub}
                    onChange={(e) => patchProgram(i, { maxLoanRub: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Мин. взнос, %</label>
                  <input
                    type="number"
                    step={0.1}
                    className={inputClass}
                    value={p.minDownPaymentPercent}
                    onChange={(e) => patchProgram(i, { minDownPaymentPercent: Number(e.target.value) })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Краткая подсказка</label>
                  <input
                    className={inputClass}
                    value={p.shortHint}
                    onChange={(e) => patchProgram(i, { shortHint: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/80">Калькулятор: стартовые значения</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelClass}>Цена объекта, ₽</label>
            <input
              type="number"
              className={inputClass}
              value={data.calculatorDefaults.price}
              onChange={(e) =>
                updateField("calculatorDefaults", {
                  ...data.calculatorDefaults,
                  price: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Первоначальный взнос, ₽</label>
            <input
              type="number"
              className={inputClass}
              value={data.calculatorDefaults.initialCash}
              onChange={(e) =>
                updateField("calculatorDefaults", {
                  ...data.calculatorDefaults,
                  initialCash: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Срок, лет</label>
            <input
              type="number"
              min={1}
              max={40}
              className={inputClass}
              value={data.calculatorDefaults.years}
              onChange={(e) =>
                updateField("calculatorDefaults", {
                  ...data.calculatorDefaults,
                  years: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Ставка по умолчанию, %</label>
            <input
              type="number"
              step={0.1}
              className={inputClass}
              value={data.calculatorDefaults.rate}
              onChange={(e) =>
                updateField("calculatorDefaults", {
                  ...data.calculatorDefaults,
                  rate: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Материнский капитал в калькуляторе, ₽</label>
          <input
            type="number"
            className={`${inputClass} max-w-md`}
            value={data.maternityCapitalRub}
            onChange={(e) => updateField("maternityCapitalRub", Number(e.target.value))}
          />
        </div>
      </section>

      <section className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/80">Блок доверия</h2>
        <div>
          <label className={labelClass}>Банки-партнёры (по одному в строке)</label>
          <textarea
            className={`${inputClass} font-mono text-[13px]`}
            rows={4}
            value={data.trustBanks.join("\n")}
            onChange={(e) =>
              updateField(
                "trustBanks",
                e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        </div>
        <div>
          <label className={labelClass}>Текст под банками</label>
          <textarea
            className={inputClass}
            rows={2}
            value={data.trustBanksNote}
            onChange={(e) => updateField("trustBanksNote", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Пункты «Почему с нами» (по одному в строке)</label>
          <textarea
            className={inputClass}
            rows={6}
            value={data.trustPoints.join("\n")}
            onChange={(e) =>
              updateField(
                "trustPoints",
                e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        </div>
        <div>
          <label className={labelClass}>Дисклеймер внизу блока</label>
          <textarea
            className={inputClass}
            rows={3}
            value={data.trustDisclaimer}
            onChange={(e) => updateField("trustDisclaimer", e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white/80">Сноска под таблицей программ</h2>
        <textarea
          className={inputClass}
          rows={5}
          value={data.programsFootnote}
          onChange={(e) => updateField("programsFootnote", e.target.value)}
          placeholder={"* Первая строка\n** Вторая строка"}
        />
      </section>
    </div>
  );
}
