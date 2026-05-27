"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { AdminFormCollapsible, AdminFormSection } from "@/components/admin/admin-form-section";
import {
  ADMIN_CALCULATOR_HELP,
  CALCULATOR_GROUP_LABELS,
  CALCULATOR_WALL_LABELS,
  calculatorCategoryTitle,
} from "@/lib/admin-calculator-ui";
import { fractionToPercentInput } from "@/lib/admin-calculator-save";

const inp =
  "w-full rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#0F3D2E]";

type ApiCategory = {
  id: string;
  labelRu: string;
  facadeCoef: number;
  roofCoef: number;
  shellPrices: { wallMaterial: string; pricePerM2: number }[];
};

type ApiFacade = { id: string; slug: string; name: string; pricePerM2: number };
type ApiOption = {
  id: string;
  slug: string;
  name: string;
  groupSlug: string;
  pricePerUnit: number;
  isActive: boolean;
};

type ApiSettings = {
  smallAreaThresholdM2: number;
  smallAreaSurcharge: number;
  blindAreaWidthM: number;
};

type ApiPayload = {
  categories: ApiCategory[];
  facades: ApiFacade[];
  options: ApiOption[];
  settings: ApiSettings | null;
};

type SettingsForm = {
  smallAreaThresholdM2: string;
  smallAreaSurchargePercent: string;
  blindAreaWidthM: string;
};

type CategoryForm = {
  id: string;
  labelRu: string;
  facadeCoef: string;
  roofCoef: string;
  gas: string;
  ceramic: string;
  brick: string;
};

type FacadeForm = { id: string; slug: string; name: string; pricePerM2: string };
type OptionForm = { id: string; slug: string; name: string; groupSlug: string; pricePerUnit: string; isActive: boolean };

function shellPrice(cat: ApiCategory, wall: string): string {
  const row = cat.shellPrices.find((p) => p.wallMaterial === wall);
  return row ? String(row.pricePerM2) : "0";
}

function mapPayloadToForms(data: ApiPayload) {
  const settings: SettingsForm = {
    smallAreaThresholdM2: String(data.settings?.smallAreaThresholdM2 ?? 100),
    smallAreaSurchargePercent: String(
      fractionToPercentInput(data.settings?.smallAreaSurcharge ?? 0.15)
    ),
    blindAreaWidthM: String(data.settings?.blindAreaWidthM ?? 0.8),
  };
  const categories: CategoryForm[] = data.categories.map((c) => ({
    id: c.id,
    labelRu: c.labelRu,
    facadeCoef: String(c.facadeCoef),
    roofCoef: String(c.roofCoef),
    gas: shellPrice(c, "gas"),
    ceramic: shellPrice(c, "ceramic"),
    brick: shellPrice(c, "brick"),
  }));
  const facades: FacadeForm[] = data.facades.map((f) => ({
    id: f.id,
    slug: f.slug,
    name: f.name,
    pricePerM2: String(f.pricePerM2),
  }));
  const options: OptionForm[] = data.options.map((o) => ({
    id: o.id,
    slug: o.slug,
    name: o.name,
    groupSlug: o.groupSlug,
    pricePerUnit: String(o.pricePerUnit),
    isActive: o.isActive,
  }));
  return { settings, categories, facades, options };
}

async function patchCalculator(body: Record<string, unknown>) {
  const res = await fetch("/api/admin/calculator", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(typeof json.error === "string" ? json.error : "save failed");
  }
}

export function AdminCalculatorEditor() {
  const [data, setData] = useState<ApiPayload | null>(null);
  const [settings, setSettings] = useState<SettingsForm | null>(null);
  const [categories, setCategories] = useState<CategoryForm[]>([]);
  const [facades, setFacades] = useState<FacadeForm[]>([]);
  const [options, setOptions] = useState<OptionForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [bulkPercent, setBulkPercent] = useState("5");
  const [bulkGroup, setBulkGroup] = useState("construction");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/calculator");
      const json = (await res.json()) as ApiPayload & { error?: string };
      if (!res.ok) throw new Error(json.error ?? "load failed");
      setData(json);
      const forms = mapPayloadToForms(json);
      setSettings(forms.settings);
      setCategories(forms.categories);
      setFacades(forms.facades);
      setOptions(forms.options);
    } catch {
      setMessage({ type: "err", text: "Не удалось загрузить калькулятор" });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const engineeringOptions = useMemo(
    () => options.filter((o) => o.groupSlug === "engineering"),
    [options]
  );
  const constructionOptions = useMemo(
    () => options.filter((o) => o.groupSlug === "construction"),
    [options]
  );

  async function saveSettings() {
    if (!settings) return;
    setSaving("settings");
    setMessage(null);
    try {
      await patchCalculator({ settings });
      setMessage({ type: "ok", text: "Общие настройки сохранены" });
      await load();
    } catch {
      setMessage({ type: "err", text: "Не удалось сохранить настройки" });
    } finally {
      setSaving(null);
    }
  }

  async function saveCategories() {
    setSaving("categories");
    setMessage(null);
    try {
      await patchCalculator({
        categories: categories.map((c) => ({
          id: c.id,
          facadeCoef: Number(c.facadeCoef),
          roofCoef: Number(c.roofCoef),
          shellPrices: {
            gas: Number(c.gas),
            ceramic: Number(c.ceramic),
            brick: Number(c.brick),
          },
        })),
      });
      setMessage({ type: "ok", text: "Категории и коробка сохранены" });
      await load();
    } catch {
      setMessage({ type: "err", text: "Не удалось сохранить категории" });
    } finally {
      setSaving(null);
    }
  }

  async function saveFacades() {
    setSaving("facades");
    setMessage(null);
    try {
      await patchCalculator({
        facades: facades.map((f) => ({
          id: f.id,
          name: f.name,
          pricePerM2: Number(f.pricePerM2),
        })),
      });
      setMessage({ type: "ok", text: "Фасады сохранены" });
      await load();
    } catch {
      setMessage({ type: "err", text: "Не удалось сохранить фасады" });
    } finally {
      setSaving(null);
    }
  }

  async function saveOptions(group: "engineering" | "construction") {
    setSaving(group);
    setMessage(null);
    const slice = options.filter((o) => o.groupSlug === group);
    try {
      await patchCalculator({
        options: slice.map((o) => ({
          id: o.id,
          pricePerUnit: Number(o.pricePerUnit),
          isActive: o.isActive,
        })),
      });
      setMessage({
        type: "ok",
        text: group === "engineering" ? "Инженерия сохранена" : "Стройопции сохранены",
      });
      await load();
    } catch {
      setMessage({ type: "err", text: "Не удалось сохранить опции" });
    } finally {
      setSaving(null);
    }
  }

  async function runBulk() {
    setSaving("bulk");
    setMessage(null);
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
      const label = CALCULATOR_GROUP_LABELS[bulkGroup] ?? bulkGroup;
      setMessage({ type: "ok", text: `«${label}»: цены изменены на ${bulkPercent}%` });
      await load();
    } catch {
      setMessage({ type: "err", text: "Ошибка массового обновления" });
    } finally {
      setSaving(null);
    }
  }

  async function reseed() {
    if (
      !window.confirm(
        "Вернуть все цены и коэффициенты к исходным из ТЗ? Ваши правки в справочнике будут перезаписаны."
      )
    ) {
      return;
    }
    setSaving("seed");
    setMessage(null);
    try {
      await fetch("/api/admin/calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      await load();
      setMessage({ type: "ok", text: "Справочник восстановлен из ТЗ" });
    } catch {
      setMessage({ type: "err", text: "Не удалось перезалить справочник" });
    } finally {
      setSaving(null);
    }
  }

  function updateCategory(id: string, patch: Partial<CategoryForm>) {
    setCategories((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function updateFacade(id: string, patch: Partial<FacadeForm>) {
    setFacades((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function updateOption(id: string, patch: Partial<OptionForm>) {
    setOptions((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  if (loading) {
    return <div className="p-12 text-center text-white/40">Загрузка калькулятора…</div>;
  }

  if (!data || !settings) {
    return <div className="p-12 text-center text-red-400">{message?.text || "Нет данных"}</div>;
  }

  const busy = saving !== null;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Калькулятор проектов</h1>
          <p className="text-sm text-white/45 mt-1 max-w-2xl">
            Общий прайс для расчёта стоимости на карточках проектов на сайте.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void reseed()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 px-4 py-2 text-sm text-amber-200/90 hover:bg-amber-500/10 disabled:opacity-50"
        >
          <RefreshCw size={16} className={saving === "seed" ? "animate-spin" : ""} />
          Вернуть значения из ТЗ
        </button>
      </div>

      {message ? (
        <p
          className={`text-sm rounded-xl px-4 py-2.5 border ${
            message.type === "ok"
              ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
              : "text-red-300 border-red-500/30 bg-red-500/10"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      <AdminFormSection
        title="Как это устроено"
        subtitle="Краткая инструкция — что менять здесь, а что в карточке проекта."
      >
        <ol className="list-decimal list-inside space-y-2 text-sm text-white/70 leading-relaxed">
          {ADMIN_CALCULATOR_HELP.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
        <p className="text-sm text-white/50 pt-2">
          Привязка к проекту:{" "}
          <Link href="/admin/house-projects" className="text-emerald-400/90 underline hover:text-emerald-300">
            Проекты домов
          </Link>
          {" → "}
          блок «Калькулятор на сайте» (категория a–f и корректировка %).
        </p>
      </AdminFormSection>

      <AdminFormSection
        title="Общие настройки"
        subtitle="Влияют на надбавку за малую площадь и отмостку в формулах калькулятора."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="space-y-1">
            <span className="text-xs text-white/40">Порог «малого» дома, м²</span>
            <input
              type="number"
              className={inp}
              value={settings.smallAreaThresholdM2}
              onChange={(e) => setSettings({ ...settings, smallAreaThresholdM2: e.target.value })}
            />
            <span className="text-[11px] text-white/30">Ниже — надбавка на коробку</span>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-white/40">Надбавка на коробку, %</span>
            <input
              type="number"
              step="0.1"
              className={inp}
              value={settings.smallAreaSurchargePercent}
              onChange={(e) => setSettings({ ...settings, smallAreaSurchargePercent: e.target.value })}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-white/40">Ширина отмостки, м</span>
            <input
              type="number"
              step="0.1"
              className={inp}
              value={settings.blindAreaWidthM}
              onChange={(e) => setSettings({ ...settings, blindAreaWidthM: e.target.value })}
            />
          </label>
        </div>
        <SaveBar onSave={() => void saveSettings()} saving={saving === "settings"} disabled={busy} />
      </AdminFormSection>

      <AdminFormSection
        title="Категории домов и цены коробки"
        subtitle="Категории a–f: коэффициенты фасада/кровли и цена коробки ₽/м² по материалу стен."
      >
        <div className="space-y-6">
          {categories.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3"
            >
              <p className="text-sm font-semibold text-white/90">
                {calculatorCategoryTitle(c.id, c.labelRu)}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="space-y-1">
                  <span className="text-xs text-white/40">Коэф. фасада</span>
                  <input
                    type="number"
                    step="0.01"
                    className={inp}
                    value={c.facadeCoef}
                    onChange={(e) => updateCategory(c.id, { facadeCoef: e.target.value })}
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-white/40">Коэф. кровли</span>
                  <input
                    type="number"
                    step="0.01"
                    className={inp}
                    value={c.roofCoef}
                    onChange={(e) => updateCategory(c.id, { roofCoef: e.target.value })}
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(["gas", "ceramic", "brick"] as const).map((wall) => (
                  <label key={wall} className="space-y-1">
                    <span className="text-xs text-white/40">
                      {CALCULATOR_WALL_LABELS[wall]}, ₽/м²
                    </span>
                    <input
                      type="number"
                      className={inp}
                      value={c[wall]}
                      onChange={(e) => updateCategory(c.id, { [wall]: e.target.value })}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <SaveBar onSave={() => void saveCategories()} saving={saving === "categories"} disabled={busy} />
      </AdminFormSection>

      <AdminFormSection title="Типы фасада" subtitle="Цена отделки фасада за м² — выбор на карточке проекта.">
        <ul className="space-y-3">
          {facades.map((f) => (
            <li
              key={f.id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_8rem] gap-3 items-end rounded-xl border border-white/[0.06] p-3"
            >
              <label className="space-y-1 block">
                <span className="text-xs text-white/40">Название</span>
                <input
                  className={inp}
                  value={f.name}
                  onChange={(e) => updateFacade(f.id, { name: e.target.value })}
                />
              </label>
              <label className="space-y-1 block">
                <span className="text-xs text-white/40">₽/м²</span>
                <input
                  type="number"
                  className={inp}
                  value={f.pricePerM2}
                  onChange={(e) => updateFacade(f.id, { pricePerM2: e.target.value })}
                />
              </label>
            </li>
          ))}
        </ul>
        <SaveBar onSave={() => void saveFacades()} saving={saving === "facades"} disabled={busy} />
      </AdminFormSection>

      <AdminFormSection
        title="Инженерия"
        subtitle="Электрика, отопление, вода и т.д. — цена за единицу расчёта (обычно за м² дома)."
      >
        <OptionsTable rows={engineeringOptions} onChange={updateOption} />
        <SaveBar
          onSave={() => void saveOptions("engineering")}
          saving={saving === "engineering"}
          disabled={busy}
        />
      </AdminFormSection>

      <AdminFormSection
        title="Стройопции"
        subtitle="Фундамент, кровля, лестницы и прочие опции. Снимите галочку, чтобы скрыть с сайта."
      >
        <OptionsTable rows={constructionOptions} onChange={updateOption} showActive />
        <SaveBar
          onSave={() => void saveOptions("construction")}
          saving={saving === "construction"}
          disabled={busy}
        />
      </AdminFormSection>

      <AdminFormCollapsible
        title="Поднять или снизить цены на %"
        subtitle="Массовое изменение всей группы. Минус — уменьшение (например −3)."
        defaultOpen={false}
      >
        <div className="flex flex-wrap gap-3 items-end">
          <label className="space-y-1 min-w-[12rem]">
            <span className="text-xs text-white/40">Что менять</span>
            <select
              value={bulkGroup}
              onChange={(e) => setBulkGroup(e.target.value)}
              className="block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
            >
              {Object.entries(CALCULATOR_GROUP_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-xs text-white/40">Изменение, %</span>
            <input
              type="number"
              value={bulkPercent}
              onChange={(e) => setBulkPercent(e.target.value)}
              className="w-28 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            onClick={() => void runBulk()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F3D2E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving === "bulk" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Применить ко всей группе
          </button>
        </div>
      </AdminFormCollapsible>
    </div>
  );
}

function SaveBar({
  onSave,
  saving,
  disabled,
}: {
  onSave: () => void;
  saving: boolean;
  disabled: boolean;
}) {
  return (
    <div className="pt-4 flex justify-end border-t border-white/[0.06] mt-4">
      <button
        type="button"
        onClick={onSave}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-xl bg-[#0F3D2E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Сохранить
      </button>
    </div>
  );
}

function OptionsTable({
  rows,
  onChange,
  showActive = false,
}: {
  rows: OptionForm[];
  onChange: (id: string, patch: Partial<OptionForm>) => void;
  showActive?: boolean;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-white/40">Нет позиций</p>;
  }
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[28rem] text-sm text-left">
        <thead className="text-white/40 text-xs uppercase">
          <tr>
            <th className="py-2 pr-3 font-medium">Название</th>
            <th className="py-2 pr-3 font-medium w-32">Цена</th>
            {showActive ? <th className="py-2 font-medium w-24">На сайте</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id} className="border-t border-white/5">
              <td className="py-2 pr-3 align-middle">
                <span className="text-white/90">{o.name}</span>
                <span className="block text-[10px] text-white/30 font-mono">{o.slug}</span>
              </td>
              <td className="py-2 pr-3 align-middle">
                <input
                  type="number"
                  className={inp}
                  value={o.pricePerUnit}
                  onChange={(e) => onChange(o.id, { pricePerUnit: e.target.value })}
                />
              </td>
              {showActive ? (
                <td className="py-2 align-middle">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={o.isActive}
                      onChange={(e) => onChange(o.id, { isActive: e.target.checked })}
                      className="rounded border-white/20"
                    />
                    <span className="text-xs text-white/50">{o.isActive ? "Да" : "Нет"}</span>
                  </label>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
