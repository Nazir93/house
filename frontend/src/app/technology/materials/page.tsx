import Link from "next/link";
import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME } from "@/lib/constants";

export async function generateMetadata() {
  return getPageMeta({
    title: `Стеновые материалы в проектах | ${SITE_NAME}`,
    description:
      "Газобетон, кирпич и керамический блок в типовых проектах домов: особенности, допуски по конструктиву и что уточнять перед стартом.",
    path: "/technology/materials",
    keywords: ["газобетон", "кирпич", "керамический блок", "стены дома", SITE_NAME],
  });
}

export default function MaterialsInfoPage() {
  return (
    <article className="page-top-offset min-h-screen pb-20" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <div className="container mx-auto max-w-3xl px-5">
        <Link href="/projects" className="text-sm font-semibold text-[var(--accent)]">
          ← К каталогу проектов
        </Link>
        <h1 className="mt-6 font-heading text-4xl md:text-5xl">Стеновые материалы</h1>
        <p className="mt-4 text-lg" style={{ color: "var(--text-muted)" }}>
          В каталоге большинство проектов допускают возведение несущих и ограждающих конструкций из газобетона, кирпича или керамических блоков —
          с подбором узлов под выбранную систему и региональные нормы снеговой и ветровой нагрузки.
        </p>
        <div className="mt-10 space-y-8 text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          <section>
            <h2 className="font-heading text-2xl text-[var(--text)]">Газобетон</h2>
            <p className="mt-3">
              Лёгкая кладка, короткие сроки монтажа стен, хорошая теплоизоляция при соблюдении толщины и защиты от влаги. Требуется аккуратная
              гидроизоляция цоколя и продуманный фасадный слой.
            </p>
            <Link href="/projects/gazobeton" className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)]">
              Смотреть проекты домов из газобетона
            </Link>
          </section>
          <section>
            <h2 className="font-heading text-2xl text-[var(--text)]">Кирпич</h2>
            <p className="mt-3">
              Высокая долговечность и предсказуемое поведение под нагрузкой. Увеличивает сроки и часть статических затрат по сравнению с блоками —
              зато даёт классический «каменный» дом и широкий выбор отделки.
            </p>
            <Link href="/projects/kirpich" className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)]">
              Смотреть проекты кирпичных домов
            </Link>
          </section>
          <section>
            <h2 className="font-heading text-2xl text-[var(--text)]">Керамический блок</h2>
            <p className="mt-3">
              Компромисс по скорости кладки и массе при сохранении инерции конструкции. Часто используется вместе с облицовочным кирпичом или
              навесным фасадом.
            </p>
            <Link href="/projects/keramoblok" className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)]">
              Смотреть проекты домов из керамоблока
            </Link>
          </section>
          <p className="rounded-2xl border p-5 text-sm" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
            Конкретный материал фиксируется в договоре на проектирование или строительство после геологии участка и выбора фундамента. Если в карточке
            указано несколько вариантов — это означает, что архитектурный объём допускает их без переработки фасада.
          </p>
        </div>
      </div>
    </article>
  );
}
