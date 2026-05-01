import { SITE_NAME, CITY } from "@/lib/constants";
import { getPageMeta } from "@/lib/get-page-meta";
import { ProjectDesignCostCalculator } from "@/components/construction/project-design-cost-calculator";

export async function generateMetadata() {
  return getPageMeta({
    title: `Индивидуальное проектирование — расчёт стоимости | ${SITE_NAME}`,
    description: `Стоимость вашего проекта дома в ${CITY}: основная и дополнительная документация от площади. Оставьте заявку на проектирование.`,
    path: "/individual-design",
    keywords: ["индивидуальный проект дома", "стоимость проектирования", CITY, SITE_NAME],
  });
}

export default function IndividualDesignPage() {
  return (
    <section className="pt-28 pb-20" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <div className="container mx-auto max-w-5xl px-5">
        <span
          className="inline-block rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em]"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          Индивидуальное проектирование
        </span>
        <h1 className="mt-5 font-heading text-4xl md:text-6xl">Индивидуальное проектирование</h1>
        <p className="mt-5 max-w-2xl text-lg" style={{ color: "var(--text-muted)" }}>
          Рассчитайте ориентировочную стоимость архитектурно-строительного проекта по площади дома и выбранным опциям.
          Точная смета — после выезда и брифа.
        </p>

        <div className="mt-10">
          <ProjectDesignCostCalculator source="individual-design" defaultArea={140} />
        </div>
      </div>
    </section>
  );
}
