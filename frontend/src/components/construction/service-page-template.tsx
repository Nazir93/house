import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ConstructionServiceDefinition } from "@/lib/construction-service-data";
import { SITE_NAME } from "@/lib/constants";
import { ConstructionServicesSubnav } from "./construction-services-subnav";
import { ConstructionOfferTabs } from "./construction-offer-tabs";
import { ConstructionServiceGallery } from "./construction-service-gallery";
import { LeadMiniForm } from "./lead-mini-form";

export function ConstructionServiceTemplate({ service }: { service: ConstructionServiceDefinition }) {
  return (
    <main style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <section className="pb-12 pt-24 md:pb-16 md:pt-28">
        <div className="container mx-auto max-w-[1200px] px-5">
          <nav className="text-[12px] tracking-[0.02em] sm:text-[13px]" style={{ color: "var(--text-muted)" }} aria-label="Хлебные крошки">
            <Link href="/" className="transition-colors hover:text-[var(--accent)]">
              Главная
            </Link>
            <span className="mx-2 text-[var(--text-subtle)]">/</span>
            <Link href="/services" className="transition-colors hover:text-[var(--accent)]">
              Услуги
            </Link>
            <span className="mx-2 text-[var(--text-subtle)]">/</span>
            <span style={{ color: "var(--text)" }}>{service.title}</span>
          </nav>

          <ConstructionServicesSubnav />

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.14em]" style={{ color: "var(--text-muted)" }}>
                Услуги · {SITE_NAME}
              </p>
              <h1 className="mt-3 font-heading text-3xl font-bold leading-tight tracking-tight md:text-5xl">{service.title}</h1>
              <p className="mt-5 max-w-3xl text-base leading-relaxed md:text-lg" style={{ color: "var(--text-muted)" }}>
                {service.intro}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-[var(--accent-contrast)] transition-opacity hover:opacity-95"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  Смотреть проекты <ArrowRight size={16} aria-hidden />
                </Link>
                <Link
                  href="/portfolio"
                  className="rounded-full border px-5 py-3 text-sm font-semibold transition-colors hover:border-[var(--accent)]"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                >
                  Наши работы
                </Link>
              </div>
            </div>
            <LeadMiniForm source={`service-${service.slug}`} service={service.title} />
          </div>

          <figure className="relative mt-12 aspect-[21/10] w-full overflow-hidden rounded-2xl bg-[var(--bg-secondary)] md:aspect-[21/9]">
            <Image
              src={service.heroImage.src}
              alt={service.heroImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />
          </figure>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <div className="rounded-[28px] border p-6 md:p-8" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
              <h2 className="font-heading text-2xl font-bold md:text-3xl">Что входит</h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {service.includes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[28px] border p-6 md:p-8" style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}>
              <h2 className="font-heading text-2xl font-bold md:text-3xl">Этапы работ</h2>
              <div className="mt-5 space-y-3">
                {service.steps.map((item, index) => (
                  <div key={item} className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-1 font-semibold" style={{ color: "var(--text)" }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 md:mt-24">
            <h2 className="font-heading text-2xl font-bold md:text-3xl" style={{ color: "var(--accent)" }}>
              Мы предлагаем
            </h2>
            <div className="mt-6">
              <ConstructionOfferTabs stripTitle={service.offerStripTitle} tabs={service.tabs} />
            </div>
          </div>

          <ConstructionServiceGallery items={service.gallery} />
        </div>
      </section>

      <section className="pb-20 pt-4 md:pb-28" style={{ backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }}>
        <div className="container mx-auto max-w-[1200px] px-5">
          <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:items-start lg:gap-16">
            <div>
              <h2 className="font-heading text-2xl font-bold leading-tight md:text-3xl">Получить консультацию специалиста</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed opacity-90 md:text-base">
                Оставьте контакты — перезвоним, уточним задачу по разделу «{service.title}» и предложим следующий шаг.
              </p>
              <LeadMiniForm variant="dark" source={`service-consult-${service.slug}`} service={service.title} />
            </div>
            <div className="hidden min-h-[200px] rounded-2xl border border-white/15 bg-white/5 lg:block" aria-hidden />
          </div>
        </div>
      </section>
    </main>
  );
}
