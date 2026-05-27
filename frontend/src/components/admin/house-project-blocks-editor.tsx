"use client";

import { Plus, Trash2 } from "lucide-react";
import type { CompletionGroup, ConstructionStep } from "@/lib/construction-shared";
import {
  ANCHOR_SECTION_OPTIONS,
  houseProjectBlockInputClass,
  type HeroPricingFormState,
  type HeroTierForm,
} from "@/lib/house-project-form-blocks";
import { AdminSelect } from "@/components/admin/admin-select";

const fieldLabel = "block text-xs font-medium text-white/45 mb-1";
const sectionTitle = "text-sm font-semibold text-white/90";
const card = "rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3";

type Props = {
  completionGroups: CompletionGroup[];
  onCompletionChange: (groups: CompletionGroup[]) => void;
  scheduleSteps: ConstructionStep[];
  onScheduleChange: (steps: ConstructionStep[]) => void;
  anchorButtons: { id: string; label: string }[];
  onAnchorsChange: (anchors: { id: string; label: string }[]) => void;
  heroPricing: HeroPricingFormState;
  onHeroPricingChange: (state: HeroPricingFormState) => void;
};

export function HouseProjectBlocksEditor({
  completionGroups,
  onCompletionChange,
  scheduleSteps,
  onScheduleChange,
  anchorButtons,
  onAnchorsChange,
  heroPricing,
  onHeroPricingChange,
}: Props) {
  return (
    <div className="space-y-8">
      <HeroPricingBlock state={heroPricing} onChange={onHeroPricingChange} />
      <CompletionBlock groups={completionGroups} onChange={onCompletionChange} />
      <ScheduleBlock steps={scheduleSteps} onChange={onScheduleChange} />
      <AnchorsBlock anchors={anchorButtons} onChange={onAnchorsChange} />
    </div>
  );
}

function HeroPricingBlock({
  state,
  onChange,
}: {
  state: HeroPricingFormState;
  onChange: (s: HeroPricingFormState) => void;
}) {
  function patch(partial: Partial<HeroPricingFormState>) {
    onChange({ ...state, ...partial });
  }

  function setTier(index: number, partial: Partial<HeroTierForm>) {
    const tiers = state.tiers.map((t, i) => (i === index ? { ...t, ...partial } : t));
    patch({ tiers });
  }

  return (
    <section className={card}>
      <h3 className={sectionTitle}>Цены в шапке карточки</h3>
      <p className="text-xs text-white/45">
        Переключатель материала стен и суммы справа от фото. Если свои цены не включены — возьмутся из поля «Цена, ₽».
      </p>

      <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
        <input
          type="checkbox"
          className="h-4 w-4 rounded accent-[#0F3D2E]"
          checked={state.useCustomTiers}
          onChange={(e) => patch({ useCustomTiers: e.target.checked })}
        />
        Задать свои цены по материалам
      </label>

      {state.useCustomTiers ? (
        <ul className="space-y-2">
          {state.tiers.map((tier, index) => (
            <li
              key={`${tier.id}-${index}`}
              className="grid grid-cols-1 sm:grid-cols-[1fr_160px_auto] gap-2 items-end"
            >
              <label className="min-w-0">
                <span className={fieldLabel}>Материал стен</span>
                <input
                  value={tier.label}
                  onChange={(e) => setTier(index, { label: e.target.value })}
                  className={houseProjectBlockInputClass}
                  placeholder="Газоблок"
                />
              </label>
              <label className="min-w-0">
                <span className={fieldLabel}>Цена, ₽</span>
                <input
                  type="number"
                  min={0}
                  value={tier.price}
                  onChange={(e) => setTier(index, { price: e.target.value })}
                  className={houseProjectBlockInputClass}
                />
              </label>
              <button
                type="button"
                onClick={() => patch({ tiers: state.tiers.filter((_, i) => i !== index) })}
                className="p-2 text-red-300/80 hover:text-red-200 disabled:opacity-30"
                disabled={state.tiers.length <= 1}
                aria-label="Удалить строку"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
          <button
            type="button"
            onClick={() =>
              patch({
                tiers: [...state.tiers, { id: `tier-${state.tiers.length + 1}`, label: "", price: "" }],
              })
            }
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300/90 hover:text-emerald-200"
          >
            <Plus size={14} />
            Добавить материал
          </button>
        </ul>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <label>
          <span className={fieldLabel}>Гарантия, лет</span>
          <input
            type="number"
            min={0}
            value={state.warrantyYears}
            onChange={(e) => patch({ warrantyYears: e.target.value })}
            className={houseProjectBlockInputClass}
            placeholder="5"
          />
        </label>
        <label>
          <span className={fieldLabel}>Срок строительства от, мес.</span>
          <input
            type="number"
            min={0}
            value={state.productionMonthsMin}
            onChange={(e) => patch({ productionMonthsMin: e.target.value })}
            className={houseProjectBlockInputClass}
            placeholder="5"
          />
        </label>
      </div>
    </section>
  );
}

function CompletionBlock({
  groups,
  onChange,
}: {
  groups: CompletionGroup[];
  onChange: (groups: CompletionGroup[]) => void;
}) {
  function updateGroup(gi: number, partial: Partial<CompletionGroup>) {
    onChange(groups.map((g, i) => (i === gi ? { ...g, ...partial } : g)));
  }

  function updateItem(gi: number, ii: number, value: string) {
    const items = groups[gi]!.items.map((item, i) => (i === ii ? value : item));
    updateGroup(gi, { items });
  }

  return (
    <section className={card}>
      <h3 className={sectionTitle}>Комплектация на странице</h3>
      <p className="text-xs text-white/45">Группы и пункты списка «что входит».</p>

      <div className="space-y-4">
        {groups.map((group, gi) => (
          <div key={gi} className="rounded-lg border border-white/[0.06] bg-black/20 p-3 space-y-3">
            <div className="flex gap-2 items-end">
              <label className="flex-1 min-w-0">
                <span className={fieldLabel}>Заголовок группы</span>
                <input
                  value={group.title}
                  onChange={(e) => updateGroup(gi, { title: e.target.value })}
                  className={houseProjectBlockInputClass}
                />
              </label>
              <button
                type="button"
                onClick={() => onChange(groups.filter((_, i) => i !== gi))}
                className="p-2 text-red-300/80 shrink-0"
                aria-label="Удалить группу"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <ul className="space-y-2">
              {group.items.map((item, ii) => (
                <li key={ii} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(e) => updateItem(gi, ii, e.target.value)}
                    className={houseProjectBlockInputClass}
                    placeholder="Пункт списка"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateGroup(gi, {
                        items: group.items.filter((_, i) => i !== ii),
                      })
                    }
                    className="p-2 text-red-300/70 shrink-0"
                    aria-label="Удалить пункт"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => updateGroup(gi, { items: [...group.items, ""] })}
              className="inline-flex items-center gap-1 text-xs text-white/55 hover:text-white/75"
            >
              <Plus size={12} />
              Пункт
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...groups, { title: "", items: [""] }])}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300/90"
      >
        <Plus size={14} />
        Добавить группу
      </button>
    </section>
  );
}

function ScheduleBlock({
  steps,
  onChange,
}: {
  steps: ConstructionStep[];
  onChange: (steps: ConstructionStep[]) => void;
}) {
  function patch(index: number, partial: Partial<ConstructionStep>) {
    onChange(steps.map((s, i) => (i === index ? { ...s, ...partial } : s)));
  }

  return (
    <section className={card}>
      <h3 className={sectionTitle}>График строительства</h3>
      <p className="text-xs text-white/45">Этапы по порядку — как на диаграмме на сайте.</p>

      <ul className="space-y-3">
        {steps.map((step, index) => (
          <li key={index} className="rounded-lg border border-white/[0.06] bg-black/20 p-3 space-y-2">
            <div className="flex gap-2 items-start">
              <span className="text-[11px] font-bold text-white/30 pt-2 w-5 shrink-0">{index + 1}.</span>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label>
                  <span className={fieldLabel}>Этап</span>
                  <input
                    value={step.title}
                    onChange={(e) => patch(index, { title: e.target.value })}
                    className={houseProjectBlockInputClass}
                  />
                </label>
                <label>
                  <span className={fieldLabel}>Срок</span>
                  <input
                    value={step.term}
                    onChange={(e) => patch(index, { term: e.target.value })}
                    className={houseProjectBlockInputClass}
                    placeholder="3–4 недели"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className={fieldLabel}>Описание</span>
                  <input
                    value={step.description}
                    onChange={(e) => patch(index, { description: e.target.value })}
                    className={houseProjectBlockInputClass}
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => onChange(steps.filter((_, i) => i !== index))}
                className="p-2 text-red-300/80 shrink-0"
                aria-label="Удалить этап"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() =>
          onChange([...steps, { title: "", term: "", description: "" }])
        }
        className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300/90"
      >
        <Plus size={14} />
        Добавить этап
      </button>
    </section>
  );
}

function AnchorsBlock({
  anchors,
  onChange,
}: {
  anchors: { id: string; label: string }[];
  onChange: (anchors: { id: string; label: string }[]) => void;
}) {
  function patch(index: number, partial: { id?: string; label?: string }) {
    onChange(anchors.map((a, i) => (i === index ? { ...a, ...partial } : a)));
  }

  return (
    <section className={card}>
      <h3 className={sectionTitle}>Кнопки навигации по странице</h3>
      <p className="text-xs text-white/45">Прокрутка к разделам карточки проекта.</p>

      <ul className="space-y-2">
        {anchors.map((anchor, index) => (
          <li
            key={index}
            className="grid grid-cols-1 sm:grid-cols-[minmax(0,200px)_1fr_auto] gap-2 items-end"
          >
            <label>
              <span className={fieldLabel}>Раздел</span>
              <AdminSelect
                value={anchor.id}
                onValueChange={(v) => patch(index, { id: v })}
                options={[...ANCHOR_SECTION_OPTIONS]}
                triggerClassName="rounded-lg px-3 py-2"
              />
            </label>
            <label>
              <span className={fieldLabel}>Текст на кнопке</span>
              <input
                value={anchor.label}
                onChange={(e) => patch(index, { label: e.target.value })}
                className={houseProjectBlockInputClass}
              />
            </label>
            <button
              type="button"
              onClick={() => onChange(anchors.filter((_, i) => i !== index))}
              className="p-2 text-red-300/80"
              aria-label="Удалить кнопку"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onChange([...anchors, { id: "plans", label: "" }])}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300/90"
      >
        <Plus size={14} />
        Добавить кнопку
      </button>
    </section>
  );
}
