import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { SITE_NAME, CITY, SERVICE_REGIONS, PHONE, PHONE_RAW } from "@/lib/constants";
import { CmsImage } from "@/components/ui/cms-image";
import { CompanyPageHeader } from "./company-page-header";

/** Локальные иллюстрации (без внешних CDN). */
const DEMO = {
  h01: "/images/portfolio/demo-house-01.svg",
  h02: "/images/portfolio/demo-house-02.svg",
  h03: "/images/portfolio/demo-house-03.svg",
  h04: "/images/portfolio/demo-house-04.svg",
  h05: "/images/portfolio/demo-house-05.svg",
  h06: "/images/portfolio/demo-house-06.svg",
} as const;

const APPROACH = [
  {
    n: "01",
    title: "Прозрачность и открытость",
    text: "Фиксируем объём работ и стоимость в договоре, на объекте показываем этапы и отклонения без «сюрпризов» в конце.",
  },
  {
    n: "02",
    title: "Перенимаем опыт лучших",
    text: "Следим за материалами и технологиями, отбираем решения под климат и регламенты, чтобы дом служил долго.",
  },
  {
    n: "03",
    title: "Развиваемся",
    text: "Показываем ход строительства и готовые объекты: портфолио, соцсети и прямые ответы команды.",
  },
  {
    n: "04",
    title: "Каждый проект — важный",
    text: "Не гоним количество: за качеством следят руководители направлений и инженеры на площадке.",
  },
] as const;

const VALUES = [
  {
    title: "Клиент = партнёр",
    caption: "Совместный проект",
    text: "Вместе проходим этапы от планировки до сдачи: понятные сроки и доступная команда.",
    src: DEMO.h01,
    alt: "Обсуждение проекта",
  },
  {
    title: "Внимание к деталям",
    caption: "Интерьер и узлы",
    text: "Продумываем инженерию, тепло и шум: чтобы жить было комфортно с первого дня.",
    src: DEMO.h02,
    alt: "Современный интерьер",
  },
  {
    title: "Честный диалог",
    caption: "Стройка на площадке",
    text: "Показываем процесс, отвечаем на вопросы и фиксируем договорённости в документах.",
    src: DEMO.h03,
    alt: "Строительная площадка",
  },
] as const;

const GALLERY_BENTO = [
  { src: DEMO.h01, alt: "Фасад дома", className: "md:col-span-2 md:row-span-2" },
  { src: DEMO.h02, alt: "Интерьер", className: "md:col-span-1 md:row-span-1" },
  { src: DEMO.h03, alt: "Стройка", className: "md:col-span-1 md:row-span-1" },
  { src: DEMO.h04, alt: "Детали отделки", className: "md:col-span-1 md:row-span-1" },
  { src: DEMO.h05, alt: "Команда на объекте", className: "md:col-span-1 md:row-span-1" },
  { src: DEMO.h06, alt: "Готовый дом", className: "md:col-span-2 md:row-span-1" },
] as const;

export function AboutPageContent() {
  return (
    <article style={{ color: "var(--text)" }}>
      <CompanyPageHeader
        breadcrumbCurrent="О нас"
        title="О нас"
        description={`${SITE_NAME}: проектирование и строительство загородных домов под ключ. Офис в ${CITY}, работаем в регионах: ${SERVICE_REGIONS}.`}
      />

      {/* Вступление — про компанию, без дублирования главной */}
      <section className="py-12 md:py-16" style={{ backgroundColor: "var(--bg-secondary)" }} aria-label="О компании">
        <div className="container mx-auto max-w-[1200px] px-5">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[1.35rem] bg-[var(--card-bg)] lg:aspect-[4/5]">
              <CmsImage
                src={DEMO.h04}
                alt="Команда на объекте"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 540px"
                priority
              />
            </div>

            <div className="min-w-0">
              <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>
                Кто мы
              </p>
              <h2 className="mt-3 font-heading text-2xl font-bold leading-tight tracking-tight md:text-3xl lg:text-[2.15rem]" style={{ color: "var(--text)" }}>
                Люди, процессы и стандарты — за каждым построенным домом
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
                {SITE_NAME} — команда проектировщиков, инженеров и прорабов. Мы не продаём «картинку на сайте»:
                показываем реальные объекты, этапы и людей, которые отвечают за результат на площадке.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Офис в {CITY}, работаем в {SERVICE_REGIONS}. На этой странице — как мы устроены и во что верим.
              </p>

              <nav className="mt-8 flex flex-wrap gap-3" aria-label="Разделы о компании">
                {[
                  { href: "/team", label: "Команда" },
                  { href: "/reviews", label: "Отзывы" },
                  { href: "/contacts", label: "Контакты" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    {item.label}
                    <ArrowRight size={15} aria-hidden />
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Цифры — асимметричная сетка */}
      <section className="py-16 md:py-24" style={{ backgroundColor: "var(--bg)" }}>
        <div className="container mx-auto max-w-[1200px] px-5">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,42%)] lg:items-center lg:gap-16">
            <div>
              <div className="flex items-start gap-4">
                <span
                  className="mt-1 hidden h-16 w-1 shrink-0 rounded-full sm:block"
                  style={{ backgroundColor: "var(--accent)" }}
                  aria-hidden
                />
                <div>
                  <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>
                    Опыт в цифрах
                  </p>
                  <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight md:text-3xl lg:text-[2.1rem]" style={{ color: "var(--text)" }}>
                    Более десяти лет
                    <br className="hidden sm:block" /> загородного строительства
                  </h2>
                </div>
              </div>

              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                <div
                  className="rounded-[1.15rem] border p-6"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
                >
                  <p className="font-heading text-4xl font-bold tabular-nums md:text-5xl" style={{ color: "var(--accent)" }}>
                    10+
                  </p>
                  <p className="mt-2 text-sm font-semibold" style={{ color: "var(--text)" }}>
                    лет на рынке
                  </p>
                  <p className="mt-1 text-sm leading-snug" style={{ color: "var(--text-muted)" }}>
                    Проектирование и строительство домов под ключ
                  </p>
                </div>
                <div
                  className="rounded-[1.15rem] border p-6"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
                >
                  <p className="font-heading text-2xl font-bold leading-tight md:text-3xl" style={{ color: "var(--text)" }}>
                    Полный цикл
                  </p>
                  <p className="mt-2 text-sm leading-snug" style={{ color: "var(--text-muted)" }}>
                    От проекта до теплого контура, инженерии и отделки — в одном подряде
                  </p>
                </div>
              </div>

              <Link
                href="/projects"
                className="mt-10 inline-flex items-center gap-2 text-sm font-semibold transition hover:gap-3"
                style={{ color: "var(--accent)" }}
              >
                Каталог авторских проектов
                <ArrowRight size={18} aria-hidden />
              </Link>
            </div>

            <div className="relative">
              <div
                className="absolute -left-3 top-6 hidden h-[calc(100%-3rem)] w-px lg:block"
                style={{ backgroundColor: "var(--border)" }}
                aria-hidden
              />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem] bg-[var(--card-bg)] shadow-[0_24px_60px_-20px_rgba(15,61,46,0.25)] lg:-rotate-1 lg:translate-x-2">
                <CmsImage
                  src={DEMO.h02}
                  alt="Интерьер готового дома"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 420px"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ценности — bento-сетка */}
      <section className="py-16 md:py-24" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="container mx-auto max-w-[1200px] px-5">
          <h2 className="font-heading text-2xl font-bold md:text-3xl" style={{ color: "var(--text)" }}>
            Миссия и ценности
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Три опоры, на которых держится каждый наш объект.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2 md:grid-rows-2 md:gap-6">
            {VALUES.map((v, i) => (
              <article
                key={v.title}
                className={`group relative flex flex-col overflow-hidden rounded-[1.2rem] border ${
                  i === 0 ? "md:row-span-2" : ""
                }`}
                style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
              >
                <div className={`relative w-full overflow-hidden ${i === 0 ? "aspect-[4/5] md:aspect-auto md:flex-1 md:min-h-[280px]" : "aspect-[16/10]"}`}>
                  <CmsImage
                    src={v.src}
                    alt={v.alt}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">{v.caption}</p>
                    <h3 className="mt-1 font-heading text-xl font-bold text-white md:text-2xl">{v.title}</h3>
                  </div>
                </div>
                <p className="p-5 text-sm leading-relaxed md:p-6" style={{ color: "var(--text-muted)" }}>
                  {v.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Подход — тёмный брендовый блок */}
      <section className="py-16 md:py-24" style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}>
        <div className="container mx-auto max-w-[1200px] px-5">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-bold md:text-4xl">Наш подход к работе</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/75">
              Четыре принципа, которые клиенты чувствуют на объекте — не только читают на сайте.
            </p>
          </div>
          <div
            className="mt-12 grid md:grid-cols-2 md:gap-px"
            style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
          >
            {APPROACH.map((item) => (
              <div
                key={item.n}
                className="relative p-8 md:p-10"
                style={{ backgroundColor: "var(--accent)" }}
              >
                <span
                  className="pointer-events-none absolute right-6 top-4 font-heading text-[4.5rem] font-bold leading-none text-white/[0.07] md:text-[5.5rem]"
                  aria-hidden
                >
                  {item.n}
                </span>
                <p className="relative font-heading text-[13px] font-semibold tracking-[0.1em] text-white/90">
                  {item.title}
                </p>
                <p className="relative mt-4 text-[15px] leading-relaxed text-white/78">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento-галерея */}
      <section className="py-16 md:py-24" style={{ backgroundColor: "var(--bg)" }}>
        <div className="container mx-auto max-w-[1400px] px-5">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end md:gap-10">
            <h2 className="max-w-lg font-heading text-2xl font-bold md:text-3xl" style={{ color: "var(--text)" }}>
              Объекты и атмосфера работы
            </h2>
            <p className="max-w-md text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Фасады, интерьеры и ход стройки — чтобы было проще представить результат до договора.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4 md:auto-rows-[minmax(140px,1fr)] md:gap-3">
            {GALLERY_BENTO.map((item, i) => (
              <div
                key={`${i}-${item.src}`}
                className={`relative min-h-[140px] overflow-hidden rounded-xl bg-[var(--card-bg)] md:min-h-[180px] ${item.className}`}
              >
                <CmsImage
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover transition duration-500 hover:scale-[1.04]"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  decoding="async"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm font-semibold transition hover:gap-3"
              style={{ color: "var(--accent)" }}
            >
              Все объекты в портфолио
              <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Награды — компактнее */}
      <section className="py-14 md:py-20" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="container mx-auto max-w-[1200px] px-5">
          <h2 className="text-center font-heading text-xl font-bold md:text-2xl" style={{ color: "var(--text)" }}>
            Награды и участие в выставках
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Участвуем в отраслевых событиях и открыто показываем качество на готовых домах.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.15rem] bg-[var(--card-bg)]">
              <CmsImage src={DEMO.h05} alt="Награды и команда" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" decoding="async" />
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.15rem] bg-[var(--card-bg)]">
              <CmsImage src={DEMO.h06} alt="Команда на объекте" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" decoding="async" />
            </div>
          </div>
        </div>
      </section>

      {/* Финал — навигация по компании, без повторения CTA главной */}
      <section
        className="relative overflow-hidden py-16 md:py-24"
        style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}
        aria-label="Другие разделы о компании"
      >
        <div
          className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full opacity-20 blur-3xl md:h-96 md:w-96"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }}
          aria-hidden
        />

        <div className="container relative mx-auto max-w-[1200px] px-5">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
              Ещё о нас
            </p>
            <h2 className="mt-4 font-heading text-[clamp(1.5rem,4vw,2.35rem)] font-bold leading-tight tracking-tight text-white">
              Познакомьтесь с командой и отзывами клиентов
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/78">
              Проекты и расчёт стоимости — на главной и в каталоге. Здесь — люди, опыт и обратная связь тех, кто уже
              построил с нами дом.
            </p>

            <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
              <Link
                href="/team"
                className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-[var(--accent)] transition hover:opacity-95"
                style={{ backgroundColor: "var(--accent-contrast)" }}
              >
                Команда
                <ArrowRight size={16} aria-hidden />
              </Link>
              <Link
                href="/reviews"
                className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/16"
              >
                Отзывы
                <ArrowRight size={16} aria-hidden />
              </Link>
              <Link
                href="/contacts"
                className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/16"
              >
                Контакты
                <ArrowRight size={16} aria-hidden />
              </Link>
            </div>

            <a
              href={`tel:${PHONE_RAW}`}
              className="mt-8 inline-flex items-center justify-center gap-2 text-sm font-medium text-white/85 transition hover:text-white"
            >
              <Phone size={16} aria-hidden />
              {PHONE}
            </a>
          </div>
        </div>
      </section>
    </article>
  );
}
