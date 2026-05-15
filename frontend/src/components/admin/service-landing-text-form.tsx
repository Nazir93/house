"use client";

import type { ServiceLandingDocument, ServiceLandingSection } from "@/lib/service-landing-schema";
import { AdminSelect } from "@/components/admin/admin-select";

const ADV_ICONS = ["wrench", "file-text", "zap", "shield", "users", "smartphone", "sun"] as const;

const inputClass =
  "w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#0F3D2E]/50";
const labelClass = "block text-[11px] font-medium text-white/45 mb-1 uppercase tracking-wider";
const sectionWrap = "rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-4";

function replaceSection(
  doc: ServiceLandingDocument,
  index: number,
  section: ServiceLandingSection
): ServiceLandingDocument {
  const sections = [...doc.sections];
  sections[index] = section;
  return { sections };
}

type Props = {
  document: ServiceLandingDocument;
  onChange: (doc: ServiceLandingDocument) => void;
};

export function ServiceLandingTextForm({ document, onChange }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-xs text-white/40 leading-relaxed">
        Ниже — все тексты страницы услуги, как на сайте. Поле «Название» выше задаёт заголовок в шапке (hero) при
        сохранении.
      </p>
      {document.sections.map((section, index) => {
        const patch = (s: ServiceLandingSection) => onChange(replaceSection(document, index, s));
        switch (section.type) {
          case "schema":
            return (
              <div key={index} className={sectionWrap}>
                <h3 className="text-sm font-semibold text-white/80">Микроразметка (поисковики)</h3>
                <div>
                  <label className={labelClass}>Название услуги (schema)</label>
                  <input
                    className={inputClass}
                    value={section.serviceName}
                    onChange={(e) => patch({ ...section, serviceName: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Описание</label>
                  <textarea
                    rows={3}
                    className={`${inputClass} resize-y min-h-[72px]`}
                    value={section.serviceDescription}
                    onChange={(e) => patch({ ...section, serviceDescription: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Slug (часто совпадает с URL услуги)</label>
                  <input
                    className={inputClass}
                    value={section.slug}
                    onChange={(e) => patch({ ...section, slug: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Диапазон цен (необязательно)</label>
                  <input
                    className={inputClass}
                    value={section.priceRange ?? ""}
                    onChange={(e) => patch({ ...section, priceRange: e.target.value || undefined })}
                  />
                </div>
              </div>
            );
          case "hero":
            return (
              <div key={index} className={sectionWrap}>
                <h3 className="text-sm font-semibold text-white/80">Шапка страницы</h3>
                <p className="text-[11px] text-white/35">Заголовок H1 подставляется из поля «Название» при сохранении.</p>
                <div>
                  <label className={labelClass}>Подзаголовок (лид)</label>
                  <textarea
                    rows={4}
                    className={`${inputClass} resize-y min-h-[96px]`}
                    value={section.subtitle}
                    onChange={(e) => patch({ ...section, subtitle: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Тег над заголовком</label>
                  <input
                    className={inputClass}
                    value={section.tag}
                    onChange={(e) => patch({ ...section, tag: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Ключ услуги (латиница, для кода)</label>
                  <input
                    className={inputClass}
                    value={section.serviceKey}
                    onChange={(e) => patch({ ...section, serviceKey: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Список преимуществ (по одному на строку)</label>
                  <textarea
                    rows={5}
                    className={`${inputClass} resize-y min-h-[100px] font-mono text-[13px]`}
                    value={section.features.join("\n")}
                    onChange={(e) =>
                      patch({
                        ...section,
                        features: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Ключевые задачи (блок справа внизу)</label>
                  <textarea
                    rows={3}
                    className={`${inputClass} resize-y min-h-[72px]`}
                    value={section.goals}
                    onChange={(e) => patch({ ...section, goals: e.target.value })}
                  />
                </div>
              </div>
            );
          case "showcase":
            return (
              <div key={index} className={sectionWrap}>
                <h3 className="text-sm font-semibold text-white/80">Витрина (плашка)</h3>
                <div>
                  <label className={labelClass}>Подпись</label>
                  <input
                    className={inputClass}
                    value={section.label ?? ""}
                    onChange={(e) => patch({ ...section, label: e.target.value || undefined })}
                  />
                </div>
              </div>
            );
          case "textBlock":
            return (
              <div key={index} className={sectionWrap}>
                <h3 className="text-sm font-semibold text-white/80">Текст в две колонки</h3>
                <div>
                  <label className={labelClass}>Левая колонка</label>
                  <textarea
                    rows={6}
                    className={`${inputClass} resize-y min-h-[120px]`}
                    value={section.leftText}
                    onChange={(e) => patch({ ...section, leftText: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Правая колонка</label>
                  <textarea
                    rows={6}
                    className={`${inputClass} resize-y min-h-[120px]`}
                    value={section.rightText}
                    onChange={(e) => patch({ ...section, rightText: e.target.value })}
                  />
                </div>
              </div>
            );
          case "pain":
            return (
              <div key={index} className={sectionWrap}>
                <h3 className="text-sm font-semibold text-white/80">Блок «Проблемы»</h3>
                <div>
                  <label className={labelClass}>Заголовок блока</label>
                  <input
                    className={inputClass}
                    value={section.title}
                    onChange={(e) => patch({ ...section, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Пункты (по одному на строку)</label>
                  <textarea
                    rows={6}
                    className={`${inputClass} resize-y min-h-[120px]`}
                    value={section.points.join("\n")}
                    onChange={(e) =>
                      patch({
                        ...section,
                        points: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Вывод (справа)</label>
                  <textarea
                    rows={3}
                    className={`${inputClass} resize-y min-h-[72px]`}
                    value={section.conclusion}
                    onChange={(e) => patch({ ...section, conclusion: e.target.value })}
                  />
                </div>
              </div>
            );
          case "advantages":
            return (
              <div key={index} className={sectionWrap}>
                <h3 className="text-sm font-semibold text-white/80">Преимущества</h3>
                <div>
                  <label className={labelClass}>Заголовок секции</label>
                  <input
                    className={inputClass}
                    value={section.title}
                    onChange={(e) => patch({ ...section, title: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  {section.items.map((item, j) => (
                    <div key={j} className="rounded-lg border border-white/[0.06] p-3 space-y-2 bg-black/20">
                      <div className="flex gap-2 flex-wrap items-center">
                        <label className="text-[10px] text-white/35">Иконка</label>
                        <AdminSelect
                          className="max-w-[200px]"
                          triggerClassName={`${inputClass} py-2`}
                          value={item.icon}
                          onValueChange={(ic) => {
                            const items = [...section.items];
                            items[j] = { ...item, icon: ic };
                            patch({ ...section, items });
                          }}
                          options={Array.from(new Set([item.icon, ...ADV_ICONS])).map((ic) => ({
                            value: ic,
                            label: ic,
                          }))}
                        />
                      </div>
                      <input
                        placeholder="Заголовок карточки"
                        className={inputClass}
                        value={item.title}
                        onChange={(e) => {
                          const items = [...section.items];
                          items[j] = { ...item, title: e.target.value };
                          patch({ ...section, items });
                        }}
                      />
                      <textarea
                        placeholder="Текст"
                        rows={2}
                        className={`${inputClass} resize-y`}
                        value={item.description}
                        onChange={(e) => {
                          const items = [...section.items];
                          items[j] = { ...item, description: e.target.value };
                          patch({ ...section, items });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          case "steps":
            return (
              <div key={index} className={sectionWrap}>
                <h3 className="text-sm font-semibold text-white/80">Этапы работы</h3>
                <div>
                  <label className={labelClass}>Заголовок секции</label>
                  <input
                    className={inputClass}
                    value={section.title}
                    onChange={(e) => patch({ ...section, title: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  {section.steps.map((st, j) => (
                    <div key={j} className="rounded-lg border border-white/[0.06] p-3 space-y-2 bg-black/20">
                      <span className="text-[10px] text-white/35">Этап {j + 1}</span>
                      <input
                        placeholder="Название этапа"
                        className={inputClass}
                        value={st.title}
                        onChange={(e) => {
                          const steps = [...section.steps];
                          steps[j] = { ...st, title: e.target.value };
                          patch({ ...section, steps });
                        }}
                      />
                      <textarea
                        placeholder="Описание"
                        rows={2}
                        className={`${inputClass} resize-y`}
                        value={st.description}
                        onChange={(e) => {
                          const steps = [...section.steps];
                          steps[j] = { ...st, description: e.target.value };
                          patch({ ...section, steps });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          case "faq":
            return (
              <div key={index} className={sectionWrap}>
                <h3 className="text-sm font-semibold text-white/80">Вопросы и ответы</h3>
                <div>
                  <label className={labelClass}>Ключ (латиница)</label>
                  <input
                    className={inputClass}
                    value={section.serviceKey}
                    onChange={(e) => patch({ ...section, serviceKey: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  {section.items.map((item, j) => (
                    <div key={j} className="rounded-lg border border-white/[0.06] p-3 space-y-2 bg-black/20">
                      <input
                        placeholder="Вопрос"
                        className={inputClass}
                        value={item.question}
                        onChange={(e) => {
                          const items = [...section.items];
                          items[j] = { ...item, question: e.target.value };
                          patch({ ...section, items });
                        }}
                      />
                      <textarea
                        placeholder="Ответ"
                        rows={3}
                        className={`${inputClass} resize-y min-h-[72px]`}
                        value={item.answer}
                        onChange={(e) => {
                          const items = [...section.items];
                          items[j] = { ...item, answer: e.target.value };
                          patch({ ...section, items });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
