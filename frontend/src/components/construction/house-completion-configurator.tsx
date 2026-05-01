"use client";

import { useMemo, useState } from "react";
import {
  AppWindow,
  BrickWall,
  DoorOpen,
  Hammer,
  Home,
  LayoutGrid,
  Layers,
  Minus,
  type LucideIcon,
} from "lucide-react";
import type { CompletionGroup } from "@/lib/construction-shared";
import { formatRub } from "@/lib/construction-shared";

type Tier = { id: string; label: string; multiplier: number };

const DEFAULT_TIERS: Tier[] = [
  { id: "gas", label: "Газоблок", multiplier: 1 },
  { id: "keramzit", label: "Керамзитоблок", multiplier: 1.034 },
  { id: "ceramic", label: "Керамический блок", multiplier: 1.034 },
  { id: "brick", label: "Кирпич", multiplier: 1.086 },
];

function tiersFromMaterials(materials: string[]): Tier[] {
  const lower = materials.map((m) => m.toLowerCase());
  const picked: Tier[] = [];
  const push = (t: Tier) => {
    if (!picked.some((p) => p.id === t.id)) picked.push(t);
  };
  for (const m of lower) {
    if (/газ|газобетон|газоблок/.test(m)) push(DEFAULT_TIERS[0]);
    else if (/керамзит/.test(m)) push(DEFAULT_TIERS[1]);
    else if (/керамич/.test(m)) push(DEFAULT_TIERS[2]);
    else if (/кирпич/.test(m)) push(DEFAULT_TIERS[3]);
  }
  if (picked.length === 0) return DEFAULT_TIERS.slice(0, 3);
  return picked;
}

function flattenCompletion(completion: CompletionGroup[]): string[] {
  return completion.flatMap((g) => g.items.map((item) => item.trim()).filter(Boolean));
}

type StageDef = {
  id: string;
  label: string;
  Icon: LucideIcon;
  keywords: string[];
  fallback: string;
};

const STAGES: StageDef[] = [
  { id: "prep", label: "Подготовительные работы", Icon: Hammer, keywords: ["подготов", "разметк", "участ"], fallback: "Разметка и организация стройплощадки по проекту." },
  { id: "foundation", label: "Фундамент", Icon: Layers, keywords: ["фундамент", "плит", "лент"], fallback: "Устройство основания согласно геологии участка." },
  { id: "walls", label: "Стены", Icon: BrickWall, keywords: ["стен", "коробк", "газобетон", "блок", "кирпич"], fallback: "Возведение несущих и ненесущих стен по проекту." },
  { id: "belt", label: "Монолитный пояс", Icon: Minus, keywords: ["пояс", "монолит", "армопояс"], fallback: "Монолитный пояс для распределения нагрузки и узлов крепления." },
  { id: "floors", label: "Перекрытия", Icon: LayoutGrid, keywords: ["перекрыт", "плит перек"], fallback: "Межэтажные перекрытия по несущей схеме дома." },
  { id: "roof", label: "Кровля", Icon: Home, keywords: ["кровл", "стропил", "контур"], fallback: "Стропильная система и кровельное покрытие." },
  { id: "windows", label: "Окна", Icon: AppWindow, keywords: ["окн"], fallback: "Остекление по спецификации проекта." },
  { id: "doors", label: "Двери", Icon: DoorOpen, keywords: ["двер"], fallback: "Входная группа и технические проёмы по комплектации." },
];

function stageDetails(stage: StageDef, flat: string[]): string[] {
  const hits = flat.filter((item) => stage.keywords.some((k) => item.toLowerCase().includes(k)));
  if (hits.length) return hits;
  return [stage.fallback];
}

export function HouseCompletionConfigurator({
  materials,
  basePrice,
  completion,
}: {
  materials: string[];
  basePrice: number;
  completion: CompletionGroup[];
}) {
  const tiers = useMemo(() => tiersFromMaterials(materials.length ? materials : DEFAULT_TIERS.map((t) => t.label)), [materials]);
  const [tierIndex, setTierIndex] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const flat = useMemo(() => flattenCompletion(completion), [completion]);
  const tier = tiers[tierIndex] ?? tiers[0];
  const priced = Math.round(basePrice * tier.multiplier);
  const stage = STAGES[stageIndex] ?? STAGES[0];
  const details = useMemo(() => stageDetails(stage, flat), [flat, stage]);

  const StageIcon = stage.Icon;

  return (
    <div className="space-y-8">
      <p className="max-w-3xl text-sm md:text-base" style={{ color: "var(--text-muted)" }}>
        Интерактивно показываем состав работ и ориентировочную стоимость по материалу стен. Дополнительные опции согласуем индивидуально.
      </p>

      <div className="flex flex-wrap gap-2 border-b pb-1" style={{ borderColor: "var(--border)" }}>
        {tiers.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTierIndex(i)}
            className={`rounded-t-xl px-4 py-3 text-left text-sm font-semibold transition md:min-w-[160px] ${
              i === tierIndex ? "bg-[var(--accent)] text-white shadow-sm" : "bg-[var(--bg-secondary)] text-[var(--text)] hover:opacity-90"
            }`}
          >
            <span className="block">{t.label}</span>
            <span className={`mt-1 block text-xs font-normal tabular-nums ${i === tierIndex ? "text-white/85" : ""}`}>{formatRub(Math.round(basePrice * t.multiplier))}</span>
          </button>
        ))}
      </div>

      <div>
        <h3 className="font-heading text-xl md:text-2xl">Входит в стоимость</h3>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Выберите этап, чтобы увидеть пояснение. Итог по выбранному материалу:{" "}
          <span className="font-semibold text-[var(--accent)]">{formatRub(priced)}</span>.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {STAGES.map((s, i) => {
            const Icon = s.Icon;
            const active = i === stageIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStageIndex(i)}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center text-xs font-semibold transition md:text-[13px] ${
                  active ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-[inset_0_0_0_1px_var(--accent)]" : "border-[var(--border)] hover:border-[var(--accent)]/40"
                }`}
                style={{ borderColor: active ? "var(--accent)" : "var(--border)" }}
              >
                <Icon className="h-6 w-6 shrink-0" strokeWidth={1.75} aria-hidden />
                <span className="leading-snug">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 rounded-[28px] border p-6 md:grid-cols-[minmax(0,1fr)_220px] md:items-start" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)]/12 text-[var(--accent)]">
              <StageIcon className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
                {tier.label}
              </p>
              <h4 className="font-heading text-2xl">{stage.label}</h4>
            </div>
          </div>
          <ul className="mt-5 space-y-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {details.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border p-4 text-sm" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text-muted)" }}>
            Ориентир по проекту
          </p>
          <p className="mt-2 font-heading text-3xl font-bold tabular-nums text-[var(--accent)]">{formatRub(priced)}</p>
          <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Сумма пересчитывается от базовой цены карточки и коэффициента материала. Точный сметный расчёт — после уточнения комплектации.
          </p>
        </div>
      </div>

      {completion.some((g) => g.note) ? (
        <div className="space-y-3 text-sm" style={{ color: "var(--text-muted)" }}>
          {completion.map((g) =>
            g.note ? (
              <p key={g.title}>
                <span className="font-semibold text-[var(--text)]">{g.title}: </span>
                {g.note}
              </p>
            ) : null
          )}
        </div>
      ) : null}
    </div>
  );
}
