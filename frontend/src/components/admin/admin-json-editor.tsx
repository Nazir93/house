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
    if (root === null) return { ok: true, lines: ["Пусто — укажите список групп или оставьте шаблон по умолчанию."] };
    if (!Array.isArray(root)) return { ok: true, lines: ["Неверный формат — нужен список групп (массив)."] };
    const lines: string[] = [`На сайте ${root.length} групп в блоке «Комплектация»:`];
    root.forEach((item, i) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const r = item as Record<string, unknown>;
        const title = String(r.title ?? "без названия");
        const items = r.items;
        const n = Array.isArray(items) ? items.length : 0;
        lines.push(`  ${i + 1}. «${title}» — ${n} пунктов`);
      } else {
        lines.push(`  ${i + 1}. ошибка в строке — проверьте запятую или скобку`);
      }
    });
    return { ok: true, lines };
  }

  if (kind === "scheduleList") {
    if (root === null) return { ok: true, lines: ["Пусто — укажите этапы или оставьте шаблон по умолчанию."] };
    if (!Array.isArray(root)) return { ok: true, lines: ["Неверный формат — нужен список этапов (массив)."] };
    const lines: string[] = [`На сайте ${root.length} этапов в графике:`];
    root.forEach((item, i) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const r = item as Record<string, unknown>;
        const title = String(r.title ?? "без названия");
        const term = r.term != null ? String(r.term) : "—";
        lines.push(`  ${i + 1}. «${title}» — ${term}`);
      } else {
        lines.push(`  ${i + 1}. ошибка в строке — проверьте запятую или скобку`);
      }
    });
    return { ok: true, lines };
  }

  if (kind === "anchorsList") {
    if (root === null) return { ok: true, lines: ["Пусто — укажите кнопки или оставьте шаблон по умолчанию."] };
    if (!Array.isArray(root)) return { ok: true, lines: ["Неверный формат — нужен список кнопок (массив)."] };
    const lines: string[] = [`На сайте ${root.length} кнопок быстрого перехода:`];
    root.forEach((item, i) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const r = item as Record<string, unknown>;
        const label = String(r.label ?? "без подписи");
        lines.push(`  ${i + 1}. «${label}»`);
      } else {
        lines.push(`  ${i + 1}. ошибка в строке — проверьте запятую или скобку`);
      }
    });
    return { ok: true, lines };
  }

  if (root === null) return { ok: true, lines: ["Пусто — на сайте подставятся значения по умолчанию."] };
  if (Array.isArray(root)) {
    return {
      ok: true,
      lines: [`Здесь нужен объект { }, а не список. Скопируйте шаблон из подсказки или очистите поле до { }.`],
    };
  }
  if (typeof root !== "object") return { ok: true, lines: ["Неверный формат — ожидается объект { }."] };

  const o = root as Record<string, unknown>;
  const lines: string[] = [];

  if (kind === "hero") {
    const tiers = o.tiers;
    if (Array.isArray(tiers) && tiers.length > 0) {
      lines.push(`В шапке карточки ${tiers.length} варианта цены по материалу:`);
      tiers.slice(0, 6).forEach((t, i) => {
        if (t && typeof t === "object") {
          const r = t as Record<string, unknown>;
          const label = String(r.label ?? "без названия");
          const price = r.price != null ? String(r.price) : "—";
          lines.push(`  ${i + 1}. ${label} — ${price} ₽`);
        }
      });
      if (tiers.length > 6) lines.push(`  … ещё ${tiers.length - 6}`);
    } else {
      lines.push("Свои цены не заданы — возьмутся из поля «Цена, ₽» и типовые коэффициенты по материалам.");
    }
    if (o.warrantyYears != null) lines.push(`Гарантия: ${String(o.warrantyYears)} лет`);
    if (o.productionMonthsMin != null) lines.push(`Срок строительства от: ${String(o.productionMonthsMin)} мес.`);
    return { ok: true, lines: lines.length ? lines : ["Пусто — на сайте подставятся цены по умолчанию."] };
  }

  if (kind === "calculator") {
    if ("consultation" in o) lines.push("Задана карточка специалиста (имя, фото, телефон).");
    if ("partOfSoul" in o) {
      if (o.partOfSoul && typeof o.partOfSoul === "object" && !Array.isArray(o.partOfSoul)) {
        const p = o.partOfSoul as Record<string, unknown>;
        const en = p.enabled === false ? "выключен" : "включён";
        const roof = p.defaultRoof != null ? String(p.defaultRoof) : "по умолчанию";
        lines.push(`Старый режим формулы ${en}; тип кровли для расчёта: ${roof}.`);
      } else {
        lines.push("Блок partOfSoul задан с ошибкой — проверьте скобки.");
      }
    }
    const bands = o.transportBands;
    if (Array.isArray(bands)) lines.push(`Надбавка за расстояние: ${bands.length} зон.`);
    const stages = o.stages;
    if (stages && typeof stages === "object" && !Array.isArray(stages)) {
      const keys = Object.keys(stages as object);
      lines.push(`Таблицы этапов работ: ${keys.length} сценариев.`);
    }
    if (o.stagesByTier && typeof o.stagesByTier === "object") {
      const tk = Object.keys(o.stagesByTier as object);
      lines.push(`Разные этапы по материалу стен: ${tk.length} вариантов.`);
    }
    const addons = o.addons;
    if (Array.isArray(addons)) lines.push(`Дополнительные опции (старый список): ${addons.length} групп.`);
    if (lines.length === 0)
      lines.push("Пусто — на сайте стандартные настройки. Цены коробки и опций задаются в разделе «Калькулятор карточки проекта» выше и в меню «Калькулятор проектов».");
    return { ok: true, lines };
  }

  const _exhaustive: never = kind;
  void _exhaustive;
  return { ok: true, lines: ["Внутренняя ошибка: неизвестный тип поля JSON."] };
}

export function AdminJsonEditor({
  label,
  hint,
  technicalName,
  value,
  onChange,
  rows = 10,
  kind,
  guide,
}: {
  label: string;
  hint?: string;
  /** Техническое имя поля в БД — мелким шрифтом под заголовком */
  technicalName?: string;
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  kind: AdminJsonEditorKind;
  guide?: ReactNode;
}) {
  const [structureOpen, setStructureOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);

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
          {technicalName ? (
            <span className="mt-0.5 block text-[10px] font-mono text-white/30">{technicalName}</span>
          ) : null}
          {hint ? (
            <p className="mt-1.5 text-sm leading-relaxed text-white/55 max-w-3xl">{hint}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-black/20 overflow-hidden">
        <button
          type="button"
          onClick={() => setStructureOpen((v) => !v)}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-emerald-300/90 hover:bg-white/[0.04]"
        >
          {structureOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <ListTree size={14} className="opacity-80" aria-hidden />
          Что будет на сайте
        </button>
        {structureOpen ? (
          <ul className="space-y-1 border-t border-white/[0.06] px-3 py-2.5 text-[13px] leading-snug text-white/70">
            {summary.lines.map((line, i) => (
              <li key={i} className={line.startsWith("  ") ? "pl-2 text-[12px]" : ""}>
                {line}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {guide ? (
        <div className="rounded-lg border border-white/[0.06] bg-black/15 overflow-hidden">
          <button
            type="button"
            onClick={() => setGuideOpen((v) => !v)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-white/55 hover:bg-white/[0.04]"
          >
            {guideOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Как заполнить
          </button>
          {guideOpen ? <div className="border-t border-white/[0.06] px-3 py-3 text-sm leading-relaxed text-white/65 space-y-2">{guide}</div> : null}
        </div>
      ) : null}

      <div className="rounded-lg border border-white/[0.06] bg-black/15 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
          <button
            type="button"
            onClick={() => setJsonOpen((v) => !v)}
            className="flex items-center gap-2 text-left text-xs font-semibold text-white/55 hover:text-white/75"
          >
            {jsonOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Редактировать вручную (для опытных)
          </button>
          {jsonOpen ? (
            <button
              type="button"
              onClick={prettify}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-white/75 transition hover:bg-white/[0.1] disabled:opacity-40"
              disabled={!summary.ok}
            >
              <AlignLeft size={12} aria-hidden />
              Выровнять
            </button>
          ) : null}
        </div>
        {jsonOpen ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            spellCheck={false}
            className="w-full border-t border-white/[0.06] px-4 py-2.5 bg-white/[0.05] text-sm text-white font-mono"
          />
        ) : null}
      </div>
    </div>
  );
}
