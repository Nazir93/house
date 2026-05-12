"use client";

import { useMemo, useState, type ReactNode } from "react";
import { AlignLeft, ChevronDown, ChevronRight, ListTree } from "lucide-react";

export type AdminJsonEditorKind =
  | "calculator"
  | "hero"
  /** Массив групп: `{ title, items: string[] }[]` */
  | "completionList"
  /** Массив этапов: `{ title, term, description }[]` */
  | "scheduleList"
  /** Массив кнопок навигации: `{ id, label }[]` — id должен совпадать с секциями на странице */
  | "anchorsList";

function tryParse(value: string): { ok: true; data: unknown } | { ok: false; message: string } {
  try {
    return { ok: true, data: JSON.parse(value) };
  } catch {
    return { ok: false, message: "JSON с ошибкой: проверьте кавычки, запятые и скобки." };
  }
}

/** Краткое человекочитаемое резюме содержимого для администратора. */
export function summarizeJsonForAdmin(
  value: string,
  kind: AdminJsonEditorKind
): { ok: true; lines: string[] } | { ok: false; lines: string[] } {
  const parsed = tryParse(value);
  if (!parsed.ok) return { ok: false, lines: [parsed.message] };
  const root = parsed.data;

  if (kind === "completionList") {
    if (root === null) return { ok: true, lines: ["null — нужен массив групп [ { title, items: [\"…\"] }, … ]."] };
    if (!Array.isArray(root)) return { ok: true, lines: ["Ожидался массив [ ] — список групп комплектации."] };
    const lines: string[] = [`Групп: ${root.length}.`];
    root.forEach((item, i) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const r = item as Record<string, unknown>;
        const title = String(r.title ?? "без названия");
        const items = r.items;
        const n = Array.isArray(items) ? items.length : "—";
        lines.push(`  ${i + 1}. «${title}» — пунктов в items: ${n}`);
      } else {
        lines.push(`  ${i + 1}. элемент не объект — проверьте формат.`);
      }
    });
    return { ok: true, lines };
  }

  if (kind === "scheduleList") {
    if (root === null) return { ok: true, lines: ["null — нужен массив этапов [ { title, term, description }, … ]."] };
    if (!Array.isArray(root)) return { ok: true, lines: ["Ожидался массив [ ] — этапы графика строительства."] };
    const lines: string[] = [`Этапов: ${root.length}.`];
    root.forEach((item, i) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const r = item as Record<string, unknown>;
        const title = String(r.title ?? "без названия");
        const term = r.term != null ? String(r.term) : "—";
        lines.push(`  ${i + 1}. «${title}» — срок: ${term}`);
      } else {
        lines.push(`  ${i + 1}. элемент не объект — проверьте формат.`);
      }
    });
    return { ok: true, lines };
  }

  if (kind === "anchorsList") {
    if (root === null) return { ok: true, lines: ["null — нужен массив [ { id, label }, … ]."] };
    if (!Array.isArray(root)) return { ok: true, lines: ["Ожидался массив [ ] — кнопки якорной навигации."] };
    const lines: string[] = [`Кнопок: ${root.length}.`];
    root.forEach((item, i) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const r = item as Record<string, unknown>;
        const id = String(r.id ?? "?");
        const label = String(r.label ?? "");
        lines.push(`  ${i + 1}. id «${id}» — «${label || "без подписи"}»`);
      } else {
        lines.push(`  ${i + 1}. элемент не объект — проверьте формат.`);
      }
    });
    return { ok: true, lines };
  }

  if (root === null) return { ok: true, lines: ["Пусто (null). Нужен объект { … }."] };
  if (Array.isArray(root)) {
    return {
      ok: true,
      lines: [`Корень — массив из ${root.length} элементов. Для этого поля нужен объект { }, не массив.`],
    };
  }
  if (typeof root !== "object") return { ok: true, lines: [`Тип корня: ${typeof root} — ожидается объект.`] };

  const o = root as Record<string, unknown>;
  const lines: string[] = [];

  if (kind === "hero") {
    const tiers = o.tiers;
    if (Array.isArray(tiers)) {
      lines.push(`Уровни цен (tiers): ${tiers.length} шт.`);
      tiers.slice(0, 6).forEach((t, i) => {
        if (t && typeof t === "object") {
          const r = t as Record<string, unknown>;
          const id = String(r.id ?? "?");
          const label = String(r.label ?? "");
          const price = r.price != null ? String(r.price) : "—";
          lines.push(`  ${i + 1}. id «${id}» — ${label || "без подписи"} — ${price} ₽`);
        }
      });
      if (tiers.length > 6) lines.push(`  … ещё ${tiers.length - 6}`);
    } else {
      lines.push("Нет массива tiers — на сайте подставятся цены по умолчанию от поля «Цена, ₽».");
    }
    if (o.warrantyYears != null) lines.push(`Гарантия (warrantyYears): ${String(o.warrantyYears)} лет`);
    if (o.productionMonthsMin != null) lines.push(`Срок производства (productionMonthsMin): ${String(o.productionMonthsMin)} мес.`);
    return { ok: true, lines: lines.length ? lines : ["Пустой объект { } — сработают значения по умолчанию."] };
  }

  if (kind === "calculator") {
    if ("consultation" in o) lines.push("consultation — карточка специалиста (имя, роль, фото, телефон).");
    if ("partOfSoul" in o) {
      if (o.partOfSoul && typeof o.partOfSoul === "object" && !Array.isArray(o.partOfSoul)) {
        const p = o.partOfSoul as Record<string, unknown>;
        const en = p.enabled === true ? "вкл." : "выкл.";
        const roof = p.defaultRoof != null ? String(p.defaultRoof) : "не задана";
        lines.push(`partOfSoul (${en}) — формульный расчёт; кровля для матрицы: ${roof} (dual | triple | quad).`);
      } else {
        lines.push("partOfSoul: задан, но не объект — проверьте формат.");
      }
    }
    const bands = o.transportBands;
    if (Array.isArray(bands)) lines.push(`transportBands: ${bands.length} зон доставки/надбавок.`);
    const stages = o.stages;
    if (stages && typeof stages === "object" && !Array.isArray(stages)) {
      const keys = Object.keys(stages as object);
      lines.push(`stages: таблицы этапов — ключи: ${keys.slice(0, 8).join(", ")}${keys.length > 8 ? "…" : ""}.`);
    }
    if (o.stagesByTier && typeof o.stagesByTier === "object") {
      const tk = Object.keys(o.stagesByTier as object);
      lines.push(`stagesByTier: отдельные таблицы по уровню цены — ${tk.length} ключ(ей): ${tk.slice(0, 5).join(", ")}${tk.length > 5 ? "…" : ""}.`);
    }
    const addons = o.addons;
    if (Array.isArray(addons)) lines.push(`addons: ${addons.length} групп доп. опций с позициями и ценами.`);
    if (lines.length === 0) lines.push("Пустой объект { } — для типового проекта подставится пресет «Аврора».");
    return { ok: true, lines };
  }

  const _exhaustive: never = kind;
  void _exhaustive;
  return { ok: true, lines: ["Внутренняя ошибка: неизвестный тип поля JSON."] };
}

export function AdminJsonEditor({
  label,
  hint,
  value,
  onChange,
  rows = 10,
  kind,
  guide,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  kind: AdminJsonEditorKind;
  /** Развёрнутая справка внутри «Справка для администратора» */
  guide: ReactNode;
}) {
  const [structureOpen, setStructureOpen] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);

  const summary = useMemo(() => summarizeJsonForAdmin(value, kind), [value, kind]);

  function prettify() {
    const p = tryParse(value);
    if (!p.ok) return;
    onChange(JSON.stringify(p.data, null, 2));
  }

  return (
    <div className="space-y-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <span className="block text-sm font-semibold text-white/90">{label}</span>
          {hint ? (
            <p className="mt-1 text-xs leading-relaxed text-white/45 max-w-3xl">{hint}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={prettify}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/[0.1] disabled:opacity-40"
          disabled={!summary.ok}
          title={summary.ok ? "Отформатировать отступы (не меняет смысл)" : "Сначала исправьте ошибку JSON"}
        >
          <AlignLeft size={14} aria-hidden />
          Выровнять JSON
        </button>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-black/20 overflow-hidden">
        <button
          type="button"
          onClick={() => setStructureOpen((v) => !v)}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-emerald-300/90 hover:bg-white/[0.04]"
        >
          {structureOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <ListTree size={14} className="opacity-80" aria-hidden />
          Структура (читаемо)
        </button>
        {structureOpen ? (
          <ul className="space-y-1 border-t border-white/[0.06] px-3 py-2.5 text-[13px] leading-snug text-white/70">
            {summary.lines.map((line, i) => (
              <li key={i} className={line.startsWith("  ") ? "pl-2 font-mono text-[12px]" : ""}>
                {line}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-black/15 overflow-hidden">
        <button
          type="button"
          onClick={() => setGuideOpen((v) => !v)}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-white/55 hover:bg-white/[0.04]"
        >
          {guideOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          Справка для администратора
        </button>
        {guideOpen ? <div className="border-t border-white/[0.06] px-3 py-3 text-xs leading-relaxed text-white/60 space-y-2">{guide}</div> : null}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        spellCheck={false}
        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white font-mono"
      />
    </div>
  );
}
