import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE_NAME, CITY, SERVICE_REGIONS } from "@/lib/constants";
import { CompanyPageHeader } from "./company-page-header";
import { LeadershipFeedbackForm } from "./leadership-feedback-form";

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
    src: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
    alt: "Обсуждение проекта",
  },
  {
    title: "Внимание к деталям",
    caption: "Интерьер и узлы",
    text: "Продумываем инженерию, тепло и шум: чтобы жить было комфортно с первого дня.",
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    alt: "Современный интерьер",
  },
  {
    title: "Честный диалог",
    caption: "Стройка на площадке",
    text: "Показываем процесс, отвечаем на вопросы и фиксируем договорённости в документах.",
    src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    alt: "Строительная площадка",
  },
] as const;

const GALLERY = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=600&q=80",
  "https://images.unsplash.com/photo-1600566753190-acf79b681f62?w=600&q=80",
  "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=600&q=80",
  "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&q=80",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600&q=80",
  "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=600&q=80",
] as const;

export function AboutPageContent() {
  return (
    <article style={{ color: "var(--text)" }}>
      <CompanyPageHeader
        breadcrumbCurrent="О нас"
        title="О нас"
        description={`${SITE_NAME}: проектирование и строительство загородных домов под ключ. Офис в ${CITY}, работаем в регионах: ${SERVICE_REGIONS}.`}
      />

      {/* Обратная связь руководству — фон секции бренда */}
      <section className="py-14 md:py-16" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="container mx-auto max-w-[1200px] px-5">
          <LeadershipFeedbackForm />
          <p className="mx-auto mt-8 max-w-3xl text-center text-[15px] leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
            Мы дорожим каждым обращением. Поделитесь обратной связью — раз в неделю команда разбирает сообщения клиентов и берёт в работу то, что помогает нам становиться лучше.
          </p>
        </div>
      </section>

      {/* Команда / фото — полноширинный блок */}
      <section className="py-12 md:py-16" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="container mx-auto max-w-[1200px] px-5">
          <div className="relative aspect-[21/9] min-h-[220px] overflow-hidden rounded-[1.25rem] bg-[var(--card-bg)] md:aspect-[24/9]">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80"
              alt="Команда компании"
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />
          </div>
        </div>
      </section>

      {/* Цифры + фото справа */}
      <section className="py-14 md:py-20" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="container mx-auto max-w-[1200px] px-5">
          <div className="grid gap-10 lg:grid-cols-[1fr_minmax(280px,44%)] lg:items-center lg:gap-14">
            <div>
              <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>
                {SITE_NAME}
              </p>
              <h2 className="mt-3 font-heading text-2xl font-bold uppercase tracking-tight md:text-3xl lg:text-[2.1rem]" style={{ color: "var(--text)" }}>
                Цифры и опыт
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Создаём дома, в которых комфортно жить: проект, материалы и сопровождение на всех этапах. Кратко — в цифрах:
              </p>
              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                <div>
                  <p className="font-heading text-4xl font-bold tabular-nums md:text-5xl" style={{ color: "var(--text)" }}>
                    10+ лет
                  </p>
                  <p className="mt-2 text-sm leading-snug" style={{ color: "var(--text-muted)" }}>
                    На рынке загородного строительства
                  </p>
                </div>
                <div>
                  <p className="font-heading text-4xl font-bold tabular-nums md:text-5xl" style={{ color: "var(--text)" }}>
                    Объекты под ключ
                  </p>
                  <p className="mt-2 text-sm leading-snug" style={{ color: "var(--text-muted)" }}>
                    От проекта до теплого контура и отделки
                  </p>
                </div>
              </div>
              <div className="mt-10">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-[var(--accent-contrast)] transition hover:opacity-95"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  Смотреть проекты
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-[var(--card-bg)] lg:aspect-[3/4]">
              <Image
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&q=80"
                alt="Команда на объекте"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 440px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Миссия и ценности */}
      <section className="py-14 md:py-20" style={{ backgroundColor: "var(--bg)" }}>
        <div className="container mx-auto max-w-[1200px] px-5">
          <h2 className="font-heading text-2xl font-bold md:text-3xl" style={{ color: "var(--text)" }}>
            Миссия и ценности
          </h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Наша миссия — строить качественные дома и сохранять спокойствие клиента на всём пути: от идеи до ключей.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {VALUES.map((v) => (
              <article key={v.title} className="flex flex-col overflow-hidden rounded-[1.15rem] border" style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}>
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image src={v.src} alt={v.alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  <p className="absolute bottom-3 left-4 right-4 font-heading text-lg font-bold text-white drop-shadow-sm">{v.title}</p>
                </div>
                <p className="px-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--accent)" }}>
                  {v.caption}
                </p>
                <p className="flex-1 px-4 pb-5 pt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {v.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Наш подход — тёмный блок бренда (#0F3D2E) */}
      <section className="py-16 md:py-20" style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}>
        <div className="container mx-auto max-w-[1200px] px-5">
          <h2 className="text-center font-heading text-2xl font-bold md:text-3xl lg:text-4xl">Наш подход к работе</h2>
          <div
            className="mt-12 grid md:grid-cols-2 md:gap-px"
            style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
          >
            {APPROACH.map((item) => (
              <div key={item.n} className="p-8 md:p-10" style={{ backgroundColor: "var(--accent)" }}>
                <p className="font-heading text-[13px] font-semibold tabular-nums tracking-[0.12em] text-white/88">
                  [{item.n}] {item.title}
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-white/78">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Сетка атмосферы / объектов */}
      <section className="py-14 md:py-20" style={{ backgroundColor: "var(--bg-secondary)" }}>
        <div className="container mx-auto max-w-[1400px] px-5">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end md:gap-10">
            <h2 className="max-w-xl font-heading text-2xl font-bold md:text-3xl" style={{ color: "var(--text)" }}>
              Наши объекты и атмосфера работы
            </h2>
            <p className="max-w-md text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Фасады, интерьеры и ход стройки — чтобы было проще представить результат до договора.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-px bg-[var(--border)] md:grid-cols-4">
            {GALLERY.map((src, i) => (
              <div key={src} className="relative aspect-square bg-[var(--card-bg)]">
                <Image src={src} alt={`Объект ${i + 1}`} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Награды / двойное фото */}
      <section className="pb-20 pt-4 md:pb-28" style={{ backgroundColor: "var(--bg)" }}>
        <div className="container mx-auto max-w-[1200px] px-5">
          <h2 className="text-center font-heading text-xl font-bold md:text-2xl" style={{ color: "var(--text)" }}>
            Награды и участие в выставках
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Участвуем в отраслевых событиях и открыто показываем качество на готовых домах.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.15rem] bg-[var(--card-bg)]">
              <Image
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=900&q=80"
                alt="Награды и команда"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.15rem] bg-[var(--card-bg)]">
              <Image
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=80"
                alt="Команда на объекте"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              href="/portfolio"
              className="inline-flex rounded-full border px-6 py-3 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              Портфолио
            </Link>
            <Link
              href="/contacts"
              className="inline-flex rounded-full px-6 py-3 text-sm font-semibold text-[var(--on-sale)] transition hover:opacity-95"
              style={{ backgroundColor: "var(--sale)" }}
            >
              Оставить заявку
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
