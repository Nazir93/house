"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bath,
  Bed,
  ChevronLeft,
  ChevronRight,
  Home,
  Layers2,
  Mail,
  Send,
  Share2,
} from "lucide-react";
import { CompareButton } from "@/components/construction/compare-button";
import { ConstructionScheduleGantt } from "@/components/construction/construction-schedule-gantt";
import { HouseCompletionConfigurator } from "@/components/construction/house-completion-configurator";
import { LeadMiniForm } from "@/components/construction/lead-mini-form";
import { MortgageInlineEstimator } from "@/components/construction/mortgage-inline-estimator";
import { ProjectDesignCostCalculator } from "@/components/construction/project-design-cost-calculator";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { EMAIL, SITE_URL } from "@/lib/constants";
import {
  formatRub,
  getProjectPlans,
  getProjectRenders,
  type HouseProjectItem,
} from "@/lib/construction-shared";

function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return `${n} ${many}`;
  if (mod10 === 1) return `${n} ${one}`;
  if (mod10 >= 2 && mod10 <= 4) return `${n} ${few}`;
  return `${n} ${many}`;
}

export function HouseProjectDetailContent({
  project,
  similarProjects,
}: {
  project: HouseProjectItem;
  similarProjects: HouseProjectItem[];
}) {
  const renders = getProjectRenders(project);
  const plans = getProjectPlans(project);
  const [activeRender, setActiveRender] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const slides = useMemo(
    () => [...renders, ...plans].map((media) => ({ type: "image" as const, url: media.url })),
    [plans, renders]
  );

  function openMedia(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  const active = renders[activeRender] ?? renders[0];

  const telegramShareUrl = useMemo(() => {
    const pageUrl = `${SITE_URL.replace(/\/$/, "")}/projects/${project.slug}`;
    return `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(project.title)}`;
  }, [project.slug, project.title]);

  const mailtoProjectHref = useMemo(() => {
    const subject = `Проект «${project.title}»`;
    const body = `Здравствуйте!\n\nИнтересует проект «${project.title}».\n\nСтраница проекта: ${SITE_URL.replace(/\/$/, "")}/projects/${project.slug}\n`;
    return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [project.slug, project.title]);

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => (a.floor ?? 999) - (b.floor ?? 999)),
    [plans]
  );

  const visibleAnchors = useMemo(
    () => project.anchors.filter((a) => project.mortgageEnabled || a.id !== "mortgage"),
    [project.anchors, project.mortgageEnabled]
  );

  function planSlideIndex(planId: string) {
    const idx = plans.findIndex((p) => p.id === planId);
    return idx >= 0 ? renders.length + idx : renders.length;
  }

  return (
    <>
      <ImageLightbox slides={slides} index={lightboxIndex} open={lightboxOpen} onClose={() => setLightboxOpen(false)} onIndexChange={setLightboxIndex} alt={project.title} />
      <article className="pt-24" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
        <section className="container mx-auto px-5 pb-10 md:pb-16">
          <nav className="text-sm" aria-label="Хлебные крошки" style={{ color: "var(--text-muted)" }}>
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link href="/" className="transition hover:text-[var(--accent)]">
                  Главная
                </Link>
              </li>
              <li aria-hidden className="text-[var(--text-subtle)]">
                /
              </li>
              <li>
                <Link href="/projects" className="transition hover:text-[var(--accent)]">
                  Проекты
                </Link>
              </li>
              <li aria-hidden className="text-[var(--text-subtle)]">
                /
              </li>
              <li className="font-medium text-[var(--text)]">{project.title}</li>
            </ol>
          </nav>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.isNew ? (
              <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white">Новый проект</span>
            ) : null}
          </div>
          <h1 className="mt-3 font-heading text-4xl leading-tight md:text-5xl lg:text-6xl">{project.title}</h1>
          <p className="mt-4 max-w-3xl text-lg" style={{ color: "var(--text-muted)" }}>
            {project.shortDescription}
          </p>
          {project.builtObjectSlug ? (
            <p className="mt-4">
              <Link
                href={`/portfolio/${project.builtObjectSlug}`}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ borderColor: "var(--border)" }}
              >
                <Home size={18} className="text-[var(--accent)]" aria-hidden />
                Построенный дом по этому проекту
                <ArrowRight size={16} aria-hidden />
              </Link>
            </p>
          ) : null}

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
            <div className="relative min-h-0 overflow-hidden rounded-[32px] bg-[var(--stone)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
              {active ? (
                <button type="button" onClick={() => openMedia(activeRender)} className="relative block min-h-[320px] w-full cursor-zoom-in sm:min-h-[380px] lg:min-h-[420px]">
                  <img src={active.url} alt={active.alt || project.title} className="h-[58vw] max-h-[640px] min-h-[320px] w-full object-cover sm:h-[min(58vw,520px)]" />
                </button>
              ) : (
                <div className="flex min-h-[420px] items-center justify-center text-[var(--text-subtle)]">Рендер проекта</div>
              )}
              {renders.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Предыдущий рендер"
                    onClick={() => setActiveRender((value) => (value - 1 + renders.length) % renders.length)}
                    className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-white/95 text-[var(--accent)] shadow-md transition hover:bg-white"
                    style={{ borderColor: "var(--accent)" }}
                  >
                    <ChevronLeft size={22} strokeWidth={2.25} />
                  </button>
                  <button
                    type="button"
                    aria-label="Следующий рендер"
                    onClick={() => setActiveRender((value) => (value + 1) % renders.length)}
                    className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-white/95 text-[var(--accent)] shadow-md transition hover:bg-white"
                    style={{ borderColor: "var(--accent)" }}
                  >
                    <ChevronRight size={22} strokeWidth={2.25} />
                  </button>
                  <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                    {renders.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Слайд ${i + 1}`}
                        aria-current={i === activeRender}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveRender(i);
                        }}
                        className="pointer-events-auto h-2.5 w-2.5 rounded-full transition-all"
                        style={{
                          backgroundColor: i === activeRender ? "var(--accent)" : "rgba(255,255,255,0.55)",
                          boxShadow: i === activeRender ? "0 0 0 2px rgba(255,255,255,0.9)" : "0 0 0 1px rgba(0,0,0,0.12)",
                        }}
                      />
                    ))}
                  </div>
                </>
              ) : null}
              {renders.length > 0 ? (
                <div
                  className="pointer-events-none absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium tabular-nums text-white"
                  style={{ backgroundColor: "rgba(15, 20, 18, 0.55)" }}
                >
                  <span className="opacity-90">{renders.length} фото</span>
                </div>
              ) : null}
            </div>

            <aside className="rounded-[28px] border p-5 md:p-6" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
              <p className="font-heading text-4xl font-bold leading-none tracking-tight md:text-[2.75rem]">
                {project.area} м²
              </p>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Материал стен:{" "}
                <Link href="/technology/materials" className="font-semibold text-[var(--accent)] underline-offset-2 hover:underline">
                  {project.materials.join(", ") || "на выбор"}
                </Link>
              </p>
              <div className="mt-5 flex flex-wrap gap-6 text-sm font-semibold">
                <span className="inline-flex items-center gap-2">
                  <Bed size={20} className="text-[var(--accent)]" aria-hidden />
                  {pluralRu(project.rooms, "комната", "комнаты", "комнат")}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Bath size={20} className="text-[var(--accent)]" aria-hidden />
                  {pluralRu(project.bathrooms, "санузел", "санузла", "санузлов")}
                </span>
              </div>

              <div className="mt-6 rounded-2xl p-5 text-white" style={{ backgroundColor: "var(--accent)" }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-sm uppercase tracking-[0.14em] text-white/70">Стоимость проекта</p>
                  {project.pricePromo ? (
                    <span className="shrink-0 rounded-md bg-[var(--sale)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Акция</span>
                  ) : null}
                </div>
                <p className="mt-2 text-3xl font-semibold tabular-nums">{formatRub(project.price)}</p>
                {project.pricePromo ? <p className="mt-3 text-sm leading-snug text-white/90">{project.pricePromo}</p> : null}
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                <a
                  href={telegramShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold text-white transition hover:opacity-[0.96]"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  <Send size={18} strokeWidth={2} aria-hidden />
                  В Telegram
                  <Share2 size={16} className="ml-auto opacity-90" aria-hidden />
                </a>
                <a
                  href={mailtoProjectHref}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 bg-transparent px-4 py-3.5 text-sm font-semibold transition hover:bg-black/[0.03]"
                  style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                >
                  <Mail size={18} strokeWidth={2} aria-hidden />
                  На почту
                  <Layers2 size={16} className="ml-auto opacity-80" aria-hidden />
                </a>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <CompareButton projectId={project.id} className="w-full justify-center sm:w-auto sm:min-w-[10rem]" />
                <Link
                  href="/individual-design"
                  className="inline-flex w-full justify-center rounded-full border px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] sm:w-auto"
                  style={{ borderColor: "var(--border)", color: "var(--text)" }}
                >
                  Создать свой проект
                </Link>
              </div>

              <h2 className="mt-8 font-heading text-xl md:text-2xl">Технические характеристики</h2>
              <div className="mt-4 space-y-3">
                {[
                  [
                    "Площадь дома",
                    `${project.area} м²`,
                    "/technology/house-area" as const,
                  ],
                  ["Этажность", String(project.floors), null],
                  ["Жилые комнаты", String(project.rooms), null],
                  ["Санузлы", String(project.bathrooms), null],
                  [
                    "Материалы",
                    project.materials.join(", ") || "на выбор",
                    "/technology/materials" as const,
                  ],
                ].map(([label, value, href]) => (
                  <div key={label} className="flex justify-between gap-4 border-b pb-3 text-sm last:border-0" style={{ borderColor: "var(--border)" }}>
                    <span style={{ color: "var(--text-muted)" }}>
                      {href ? (
                        <Link href={href} className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
                          {label}
                        </Link>
                      ) : (
                        label
                      )}
                    </span>
                    <span className="text-right font-semibold">{value}</span>
                  </div>
                ))}
              </div>
              <Link href="/technology/house-area" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                Как считается площадь дома <ArrowRight size={15} />
              </Link>
            </aside>
          </div>
        </section>

        <nav
          className="sticky top-[5.5rem] z-[35] border-y backdrop-blur md:top-24"
          style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--bg) 92%, transparent)" }}
          aria-label="Разделы проекта"
        >
          <div className="container mx-auto flex gap-2 overflow-x-auto px-5 py-3">
            {visibleAnchors.map((anchor) => (
              <a
                key={anchor.id}
                href={`#${anchor.id}`}
                className="shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ borderColor: "var(--border)", color: "var(--text)" }}
              >
                {anchor.label}
              </a>
            ))}
          </div>
        </nav>

        <section id="plans" className="scroll-mt-[8.5rem] md:scroll-mt-[9rem]">
          <div className="container mx-auto grid gap-10 px-5 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] lg:items-start lg:gap-12">
            <div className="min-w-0">
              <h2 className="font-heading text-3xl md:text-4xl">Планировки</h2>
              <p className="mt-3 max-w-2xl text-sm md:text-base" style={{ color: "var(--text-muted)" }}>
                Нажмите на схему для просмотра в полном размере.
                {sortedPlans.length >= 2
                  ? " На большом экране планы нескольких этажей показываются рядом, без вертикальной прокрутки между ними."
                  : null}
              </p>
              {sortedPlans.length === 0 ? (
                <p className="mt-8 text-sm" style={{ color: "var(--text-muted)" }}>
                  Планировки появятся после загрузки в карточке проекта.
                </p>
              ) : (
                <div className={`mt-8 grid gap-4 ${sortedPlans.length >= 2 ? "lg:grid-cols-2 lg:gap-5" : ""}`}>
                  {sortedPlans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => openMedia(planSlideIndex(plan.id))}
                      className="group overflow-hidden rounded-[24px] border bg-[var(--bg)] text-left shadow-sm transition hover:border-[var(--accent)]"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="relative flex max-h-[min(70vh,560px)] min-h-[240px] items-center justify-center bg-[var(--stone)] p-3 lg:min-h-[280px]">
                        <img
                          src={plan.url}
                          alt={plan.alt || plan.label || project.title}
                          className="max-h-[min(68vh,520px)] w-full object-contain transition duration-300 group-hover:scale-[1.02]"
                        />
                      </div>
                      <div className="border-t p-4 font-semibold" style={{ borderColor: "var(--border)" }}>
                        {plan.label || (plan.floor != null ? `${plan.floor} этаж` : "Планировка")}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="min-w-0 lg:sticky lg:top-[8rem] lg:self-start">
              <ProjectDesignCostCalculator
                source="house-project-design"
                defaultArea={project.area}
                projectSlug={project.slug}
                projectTitle={project.title}
              />
            </div>
          </div>
        </section>

        <section id="completion" className="scroll-mt-[8.5rem] md:scroll-mt-[9rem] py-16" style={{ backgroundColor: "var(--bg-secondary)" }}>
          <div className="container mx-auto px-5">
            <h2 className="font-heading text-3xl md:text-4xl">Комплектация</h2>
            <div className="mt-8">
              <HouseCompletionConfigurator materials={project.materials} basePrice={project.price} completion={project.completion} />
            </div>
          </div>
        </section>

        <section id="schedule" className="scroll-mt-[8.5rem] md:scroll-mt-[9rem] container mx-auto px-5 py-16">
          <h2 className="font-heading text-3xl md:text-4xl">График строительства</h2>
          <div className="mt-8">
            <ConstructionScheduleGantt steps={project.constructionSchedule} />
          </div>
        </section>

        {project.mortgageEnabled ? (
          <section id="mortgage" className="scroll-mt-[8.5rem] md:scroll-mt-[9rem] py-16" style={{ backgroundColor: "var(--accent)", color: "white" }}>
            <div className="container mx-auto px-5">
              <h2 className="font-heading text-3xl md:text-4xl">Ипотека</h2>
              {project.mortgageMode === "CALCULATOR" ? (
                <>
                  <p className="mt-4 max-w-2xl text-white/80">
                    Предварительный расчёт платежа по цене проекта. Оставьте контакты — пришлём варианты программ и подскажем по документам.
                  </p>
                  <div className="mt-8">
                    <MortgageInlineEstimator
                      variant="embed-dark"
                      defaultPrice={project.price}
                      defaultInitial={Math.round(project.price * 0.22)}
                      projectSlug={project.slug}
                      projectTitle={project.title}
                    />
                  </div>
                </>
              ) : (
                <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_minmax(280px,360px)] lg:items-start">
                  <div>
                    <p className="max-w-2xl text-white/80">
                      Оставьте заявку — подготовим расчёт по выбранному проекту с учётом цены, взноса и срока. Полный калькулятор на отдельной странице.
                    </p>
                    <Link
                      href={`/mortgage?project=${encodeURIComponent(project.slug)}`}
                      className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition hover:bg-white/95"
                      style={{ color: "var(--accent)" }}
                    >
                      Открыть калькулятор
                    </Link>
                  </div>
                  <LeadMiniForm
                    source="house-project-mortgage"
                    service={`Ипотека: ${project.title}`}
                    variant="dark"
                    submitLabel="Заявка на расчёт"
                    calcData={{ kind: "house-project", slug: project.slug, title: project.title, price: project.price }}
                  />
                </div>
              )}
            </div>
          </section>
        ) : null}

        <section className="container mx-auto px-5 py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl">Похожие проекты</h2>
              <p className="mt-2 max-w-2xl text-sm" style={{ color: "var(--text-muted)" }}>
                Подбираем по площади и цене. Если по проекту уже есть готовый объект — ссылка на него вверху страницы и ниже.
              </p>
            </div>
            {project.builtObjectSlug ? (
              <Link
                href={`/portfolio/${project.builtObjectSlug}`}
                className="inline-flex shrink-0 items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ borderColor: "var(--border)" }}
              >
                Построенный объект
              </Link>
            ) : null}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {similarProjects.map((item) => (
              <Link key={item.id} href={`/projects/${item.slug}`} className="rounded-[24px] border p-5 transition-colors hover:bg-[var(--bg-secondary)]" style={{ borderColor: "var(--border)" }}>
                <Home className="mb-4 text-[var(--accent)]" />
                <h3 className="font-heading text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{item.area} м² - {formatRub(item.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </>
  );
}
