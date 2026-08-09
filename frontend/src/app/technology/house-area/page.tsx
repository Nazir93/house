import Link from "next/link";
import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME } from "@/lib/constants";

export async function generateMetadata() {
  return getPageMeta({
    title: `Как считается площадь дома | ${SITE_NAME}`,
    description:
      "Что входит в общую площадь типового проекта загородного дома: жилые коммуникации, лестницы, технические зоны и исключения.",
    path: "/technology/house-area",
    keywords: ["площадь дома", "расчёт площади", "типовой проект", SITE_NAME],
  });
}

export default function HouseAreaInfoPage() {
  return (
    <article className="page-top-offset min-h-screen pb-20" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <div className="container mx-auto max-w-3xl px-5">
        <Link href="/projects" className="text-sm font-semibold text-[var(--accent)]">
          ← К каталогу проектов
        </Link>
        <h1 className="mt-6 font-heading text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
          Как считается площадь дома
        </h1>
        <p className="mt-4 text-lg" style={{ color: "var(--text-muted)" }}>
          На карточке каждого проекта указана расчётная общая площадь по внешнему контуру стен на всех этажах с учётом внутренних перегородок и
          коммуникаций, если они входят в типовую комплектацию проекта.
        </p>
        <div className="mt-10 space-y-6 text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          <section>
            <h2 className="font-heading text-2xl text-[var(--text)]">Что обычно входит</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>жилые комнаты и холлы;</li>
              <li>кухня-гостиная и бытовые зоны;</li>
              <li>лестничные марши и площадки внутри контура дома;</li>
              <li>гардеробные и кладовые при условии, что они учтены в проекте.</li>
            </ul>
          </section>
          <section>
            <h2 className="font-heading text-2xl text-[var(--text)]">Что часто не входит или считается отдельно</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>террасы, балконы и крыльца без утеплённого контура;</li>
              <li>гараж или навес, если они оформлены пристройкой без общей кровли;</li>
              <li>цоколь / подвал — только если в проекте не заявлены как отапливаемые этажи.</li>
            </ul>
          </section>
          <p className="rounded-2xl border p-5 text-sm" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
            Точные площади по помещениям и примыканиям фиксируются в альбоме рабочей документации к вашему договору. Если нужна корректировка под
            участок или регламент банка — напишите нам: уточним метраж до подписания сметы.
          </p>
        </div>
      </div>
    </article>
  );
}
