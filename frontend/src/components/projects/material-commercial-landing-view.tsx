import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { MaterialCommercialCtaGroup } from "@/components/projects/material-commercial-cta-group";
import { CmsImage } from "@/components/ui/cms-image";
import { builtObjectSiteStatusLabel } from "@/lib/built-object-site-status";
import {
  formatRub,
  getProjectRenders,
  type HouseProjectItem,
} from "@/lib/construction-data";
import { getBuiltObjectCover, type BuiltObjectItem } from "@/lib/construction-shared";
import { houseProjectDetailPath, type HouseProjectCatalogConfig } from "@/lib/house-project-catalog";
import { homeBuiltObjectFactsLine, homeBuiltObjectPlaceLabel } from "@/lib/home-built-homes-block";
import { resolveProjectListingPriceRub } from "@/lib/project-listing-price";
import { resolveBuiltObjectCoverAlt } from "@/lib/seo/built-object-image-seo";
import {
  formatMaterialFromPerM2,
  type MaterialCommercialLanding,
} from "@/lib/seo/project-material-commercial";
import type { ProjectMaterialSeo } from "@/lib/seo/project-material-seo";
import { materialLandingSeoInterlinks } from "@/lib/seo/seo-interlinking";

function SectionShell({
  id,
  h2,
  lead,
  children,
}: {
  id: string;
  h2: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-[var(--border)] py-10 sm:py-12 md:py-14">
      <div className="container mx-auto max-w-[1180px] px-5">
        <h2 className="w-full max-w-none text-balance font-heading text-[clamp(1.1rem,2.6vw,1.75rem)] font-bold uppercase leading-[1.15] tracking-[-0.03em] text-[var(--text)]">
          {h2}
        </h2>
        {lead ? (
          <p className="mt-4 max-w-4xl text-sm leading-relaxed text-[var(--text-muted)] md:text-[15px]">{lead}</p>
        ) : null}
        <div className="mt-7">{children}</div>
      </div>
    </section>
  );
}

export function MaterialCommercialLandingView({
  seo,
  commercial,
  catalog,
  projects,
  objects,
}: {
  seo: ProjectMaterialSeo;
  commercial: MaterialCommercialLanding;
  catalog: HouseProjectCatalogConfig;
  projects: HouseProjectItem[];
  objects: BuiltObjectItem[];
}) {
  const projectPreview = projects.filter((p) => p.published).slice(0, 6);
  const objectPreview = objects.slice(0, 6);

  return (
    <div style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      {/* Hero */}
      <section className="border-b border-[var(--border)] pb-10 pt-8 sm:pb-12 sm:pt-10 md:pb-14">
        <div className="container mx-auto max-w-[1180px] px-5">
          <nav className="text-[12px] tracking-[0.02em] text-[var(--text-muted)] sm:text-[13px]" aria-label="Навигация">
            <Link href="/" className="transition-colors hover:text-[var(--accent)]">
              Главная
            </Link>
            <span className="mx-1.5 text-[var(--text-subtle)]" aria-hidden>
              {" › "}
            </span>
            <Link href="/projects" className="transition-colors hover:text-[var(--accent)]">
              Проекты
            </Link>
            <span className="mx-1.5 text-[var(--text-subtle)]" aria-hidden>
              {" › "}
            </span>
            <span className="text-[var(--text)]">{seo.h1}</span>
          </nav>

          <h1 className="mt-5 w-full max-w-none text-balance font-heading text-[clamp(1.6rem,4vw,2.75rem)] font-bold leading-[1.12] tracking-tight text-[var(--accent)] dark:text-[var(--text)]">
            {seo.h1}
          </h1>
          <p className="mt-4 max-w-4xl text-[15px] leading-relaxed text-[var(--text-muted)] md:text-base">
            {commercial.heroLead}
          </p>
          <MaterialCommercialCtaGroup ctas={commercial.ctas} className="mt-7" />
          <ul className="mt-6 flex list-none flex-wrap gap-x-4 gap-y-2 p-0 text-sm" aria-label="Перелинковка">
            {materialLandingSeoInterlinks(seo.slug).map((link) => (
              <li key={link.id}>
                <Link
                  href={link.href}
                  className="font-semibold text-[var(--text)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SectionShell id="material-price" h2={commercial.price.h2} lead={commercial.price.note}>
        <p className="font-heading text-3xl font-bold text-[var(--sale)] md:text-4xl">
          {formatMaterialFromPerM2(commercial.price.fromPerM2Rub)}
        </p>
        <ul className="mt-6 grid list-none gap-2 p-0 sm:grid-cols-2">
          {commercial.price.factors.map((factor) => (
            <li
              key={factor}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-3 text-sm text-[var(--text)]"
            >
              {factor}
            </li>
          ))}
        </ul>
      </SectionShell>

      <SectionShell id="material-included" h2={commercial.included.h2}>
        <ul className="grid list-none gap-2 p-0 md:grid-cols-2">
          {commercial.included.items.map((item) => (
            <li
              key={item}
              className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-secondary)_45%,var(--bg))] px-4 py-3.5 text-sm leading-relaxed text-[var(--text)]"
            >
              {item}
            </li>
          ))}
        </ul>
      </SectionShell>

      <SectionShell id="material-wall-tech" h2={commercial.wallTech.h2} lead={commercial.wallTech.lead}>
        <ul className="grid list-none gap-3 p-0 sm:grid-cols-2">
          {commercial.wallTech.points.map((point) => (
            <li key={point} className="flex gap-3 text-sm leading-relaxed text-[var(--text-muted)]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </SectionShell>

      <SectionShell id="material-projects" h2={commercial.projects.h2} lead={commercial.projects.lead}>
        {projectPreview.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Проекты скоро появятся в каталоге.</p>
        ) : (
          <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {projectPreview.map((project) => {
              const cover = getProjectRenders(project)[0];
              const href = houseProjectDetailPath(catalog, project.slug, { material: seo.material });
              const price = resolveProjectListingPriceRub(project, seo.material);
              return (
                <li key={project.id}>
                  <Link
                    href={href}
                    className="group block overflow-hidden rounded-[1.35rem] border border-[var(--border)] bg-[var(--card-bg)] transition hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))]"
                  >
                    <div className="relative aspect-[4/3] bg-[var(--bg-secondary)]">
                      {cover ? (
                        <CmsImage
                          src={cover.url}
                          alt={cover.alt || project.title}
                          fill
                          className="object-cover transition duration-700 group-hover:scale-[1.03]"
                          sizes="(max-width: 1024px) 50vw, 360px"
                        />
                      ) : null}
                    </div>
                    <div className="space-y-1 px-4 py-3.5">
                      <p className="font-heading text-sm font-bold uppercase tracking-tight">{project.title}</p>
                      <p className="text-[12px] text-[var(--text-muted)]">
                        {project.area} м² · от {formatRub(price)}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link
          href={`/projects?material=${seo.material}`}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
        >
          Все проекты из этого материала
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </SectionShell>

      <SectionShell id="material-objects" h2={commercial.objects.h2} lead={commercial.objects.lead}>
        {objectPreview.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Объекты из газобетона появятся в портфолио.</p>
        ) : (
          <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {objectPreview.map((object) => {
              const cover = getBuiltObjectCover(object);
              return (
                <li key={object.id}>
                  <Link
                    href={`/portfolio/${object.slug}`}
                    className="group block overflow-hidden rounded-[1.35rem] border border-[var(--border)] bg-[var(--card-bg)] transition hover:-translate-y-0.5"
                  >
                    <div className="relative aspect-[4/3] bg-[var(--bg-secondary)]">
                      {cover?.url ? (
                        <Image
                          src={cover.url}
                          alt={resolveBuiltObjectCoverAlt(object, cover.alt)}
                          title={resolveBuiltObjectCoverAlt(object, cover.alt)}
                          fill
                          className="object-cover transition duration-700 group-hover:scale-[1.03]"
                          sizes="(max-width: 1024px) 50vw, 360px"
                        />
                      ) : null}
                      <span className="absolute left-3 top-3 rounded-full bg-[var(--card-bg)]/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide">
                        {builtObjectSiteStatusLabel(object.siteStatus)}
                      </span>
                    </div>
                    <div className="space-y-1 px-4 py-3.5">
                      <p className="font-heading text-sm font-bold uppercase tracking-tight">
                        {homeBuiltObjectPlaceLabel(object.location, object.title)}
                      </p>
                      <p className="text-[12px] text-[var(--text-muted)]">{homeBuiltObjectFactsLine(object)}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <Link
          href="/portfolio"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:text-[var(--accent)] hover:underline"
        >
          Все построенные дома
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </SectionShell>

      <SectionShell id="material-stages" h2={commercial.stages.h2}>
        <ol className="grid list-none gap-3 p-0 md:grid-cols-2">
          {commercial.stages.items.map((item, index) => (
            <li
              key={item.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-4"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                Этап {String(index + 1).padStart(2, "0")}
              </p>
              <p className="mt-2 font-heading text-base font-bold">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.body}</p>
            </li>
          ))}
        </ol>
      </SectionShell>

      <SectionShell id="material-timeline" h2={commercial.timeline.h2}>
        <ul className="grid list-none gap-3 p-0 md:grid-cols-3">
          {commercial.timeline.items.map((item) => (
            <li key={item.title} className="rounded-2xl border border-[var(--border)] px-4 py-4">
              <p className="font-heading text-sm font-bold uppercase tracking-tight">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.body}</p>
            </li>
          ))}
        </ul>
      </SectionShell>

      <SectionShell id="material-faq" h2="Частые вопросы">
        <div className="max-w-3xl space-y-3">
          {seo.faq.map((item) => (
            <details
              key={item.question}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-3"
            >
              <summary className="cursor-pointer text-sm font-semibold">{item.question}</summary>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{item.answer}</p>
            </details>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="material-form" h2={commercial.form.h2} lead={commercial.form.lead}>
        <MaterialCommercialCtaGroup ctas={commercial.ctas} />
        <p className="mt-5 text-sm text-[var(--text-muted)]">
          Или откройте{" "}
          <Link href="/calculator" className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline">
            калькулятор стоимости
          </Link>
          {" · "}
          <Link
            href="/services/proektirovanie"
            className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline"
          >
            проектирование
          </Link>
          .
        </p>
      </SectionShell>
    </div>
  );
}
