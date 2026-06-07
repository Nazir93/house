import Link from "next/link";
import { ArrowRight, FileStack, Layers, PenTool, Ruler } from "lucide-react";
import { SITE_NAME, CITY } from "@/lib/constants";
import { ProjectDesignCostCalculator } from "@/components/construction/project-design-cost-calculator";
import { DESIGN_MAIN_DOCUMENTATION_ITEMS } from "@/lib/design-project-pricing";

const STEPS = [
  {
    n: "01",
    title: "Бриф и участок",
    text: "Обсуждаем пожелания, анализируем рельеф, подъезд и ограничения по участку.",
    icon: Ruler,
  },
  {
    n: "02",
    title: "Планировки и фасады",
    text: "Архитектурные решения, площади, высоты — согласуем до рабочей документации.",
    icon: PenTool,
  },
  {
    n: "03",
    title: "Рабочий проект",
    text: "Комплект чертежей для стройки: конструктив, узлы, спецификации материалов.",
    icon: Layers,
  },
  {
    n: "04",
    title: "Сопровождение",
    text: "Ответы по проекту на этапе строительства — чтобы решения на площадке не «уплывали».",
    icon: FileStack,
  },
] as const;

export function IndividualDesignPageContent() {
  return (
    <div style={{ color: "var(--text)" }}>
      {/* Герой */}
      <section className="relative overflow-hidden border-b" style={{ borderColor: "var(--border)" }}>
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "linear-gradient(145deg, color-mix(in srgb, var(--accent) 14%, var(--bg)) 0%, var(--bg) 42%, color-mix(in srgb, var(--accent) 8%, var(--bg-secondary)) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full opacity-40 blur-3xl md:h-96 md:w-96"
          style={{ background: "color-mix(in srgb, var(--accent) 25%, transparent)" }}
          aria-hidden
        />

        <div className="page-top-offset container relative mx-auto max-w-6xl px-4 pb-10 sm:px-5 sm:pb-14 md:pb-16">
          <span
            className="inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{
              borderColor: "color-mix(in srgb, var(--accent) 35%, var(--border))",
              backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)",
              color: "var(--accent)",
            }}
          >
            Проектирование
          </span>
          <h1 className="mt-5 max-w-3xl font-heading text-[clamp(1.85rem,5vw,3.5rem)] font-bold leading-[1.08] tracking-tight">
            Индивидуальное проектирование
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: "var(--text-muted)" }}>
            Рассчитайте ориентировочную стоимость архитектурно-строительного проекта по площади дома и выбранным
            опциям. Точная смета — после выезда на участок и брифа с архитектором {SITE_NAME} в {CITY}.
          </p>

          <ul className="mt-8 flex flex-wrap gap-2 sm:gap-3">
            {["Планировки и фасады", "Рабочая документация", "3D и конструктив"].map((label) => (
              <li
                key={label}
                className="rounded-full border px-3 py-1.5 text-xs font-medium sm:text-[13px]"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "color-mix(in srgb, var(--card-bg) 70%, transparent)",
                  color: "var(--text-muted)",
                }}
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Калькулятор + этапы */}
      <section className="py-10 sm:py-14 md:py-16" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="container mx-auto max-w-6xl px-4 sm:px-5">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,440px)] lg:items-start lg:gap-10 xl:gap-12">
            <div className="min-w-0 space-y-8 lg:sticky lg:top-28">
              <div>
                <h2 className="font-heading text-xl font-bold sm:text-2xl">Как устроен проект</h2>
                <p className="mt-2 text-sm leading-relaxed sm:text-[15px]" style={{ color: "var(--text-muted)" }}>
                  Прозрачный путь от идеи до комплекта чертежей — без «серых зон» в составе работ.
                </p>
              </div>

              <ol className="space-y-4">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <li
                      key={step.n}
                      className="flex gap-4 rounded-2xl border p-4 sm:p-5"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
                    >
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--accent) 12%, transparent)",
                          color: "var(--accent)",
                        }}
                      >
                        <Icon size={20} aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--accent)" }}>
                          {step.n}
                        </p>
                        <p className="mt-0.5 font-heading text-base font-bold leading-snug">{step.title}</p>
                        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                          {step.text}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div
                className="rounded-2xl border p-4 sm:p-5"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
              >
                <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: "var(--accent)" }}>
                  В основной комплект входит
                </p>
                <ul className="mt-3 space-y-2 text-sm leading-snug" style={{ color: "var(--text-muted)" }}>
                  {DESIGN_MAIN_DOCUMENTATION_ITEMS.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="min-w-0">
              <ProjectDesignCostCalculator
                source="individual-design"
                defaultArea={140}
                layout="page"
                showPromoLink={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Низ страницы */}
      <section className="border-t py-10 sm:py-12" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
        <div className="container mx-auto max-w-6xl px-4 sm:px-5">
          <div
            className="flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            style={{
              borderColor: "color-mix(in srgb, var(--accent) 25%, var(--border))",
              backgroundColor: "color-mix(in srgb, var(--accent) 8%, var(--card-bg))",
            }}
          >
            <div className="min-w-0">
              <p className="font-heading text-lg font-bold sm:text-xl">Нужен типовой проект из каталога?</p>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                Выберите готовое решение и адаптируйте под участок — часто быстрее, чем проект с нуля.
              </p>
            </div>
            <Link
              href="/projects"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-[var(--accent-contrast)] transition hover:opacity-95"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Каталог проектов
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
