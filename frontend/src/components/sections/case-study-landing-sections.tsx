"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SERVICE_REGIONS } from "@/lib/constants";
import {
  CONSTRUCTION_SERVICE_STAGES,
  getConstructionServiceStage,
} from "@/lib/construction-services-stages";
import { TrustLeadCardBody, TrustLeadCardShell } from "@/components/sections/trust-lead-card";

export { CaseStudyFaqSectionClient } from "./case-study-faq-section-client";

export function ConstructionServicesStagesSection({ sectionClassName }: { sectionClassName?: string }) {
  const [previewId, setPreviewId] = useState(CONSTRUCTION_SERVICE_STAGES[0]!.id);
  const activeStage = getConstructionServiceStage(CONSTRUCTION_SERVICE_STAGES, previewId);

  return (
    <section className={sectionClassName ?? "mt-16 md:mt-20"} aria-labelledby="case-stages-heading">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        <h2
          id="case-stages-heading"
          className="w-full min-w-0 max-w-none flex-1 text-balance font-heading text-xl font-bold leading-tight tracking-tight text-[var(--text)] md:text-[1.45rem] lg:text-[1.6rem]"
        >
          Строительные услуги по этапам
        </h2>
        <p className="w-full min-w-0 shrink-0 max-w-md text-[12px] leading-relaxed text-[var(--text-muted)] lg:pb-0.5 lg:text-right lg:text-[13px]">
          Строительство загородных домов под ключ. Работаем в: {SERVICE_REGIONS}.
        </p>
      </div>

      <div className="mt-6 md:mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_min(340px,40%)] lg:items-start lg:gap-8 xl:gap-11">
        <ul className="flex min-w-0 flex-col border-t border-[var(--border)]">
          {CONSTRUCTION_SERVICE_STAGES.map((row) => {
            const active = row.id === previewId;
            return (
              <li key={row.id}>
                <button
                  type="button"
                  onMouseEnter={() => setPreviewId(row.id)}
                  onFocus={() => setPreviewId(row.id)}
                  onClick={() => setPreviewId(row.id)}
                  className={cn(
                    "flex w-full flex-col gap-2.5 border-b border-[var(--border)] py-4 text-left outline-none transition-colors duration-200 md:flex-row md:items-start md:gap-8 md:py-5 lg:gap-10",
                    "hover:bg-black/[0.03] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] dark:hover:bg-white/[0.04]",
                    active && "bg-[var(--accent)]/[0.08] dark:bg-[var(--accent)]/[0.12]",
                  )}
                >
                  <span className="font-heading text-[14px] font-semibold text-[var(--text)] md:w-[min(38%,260px)] md:shrink-0 md:text-[15px]">
                    {row.title}
                  </span>
                  <span className="text-[13px] leading-relaxed text-[var(--text-muted)] md:flex-1 md:text-[14px]">{row.description}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="relative mt-8 aspect-[16/10] w-full overflow-hidden rounded-2xl lg:mt-0 lg:aspect-[3/4] lg:sticky lg:top-[calc(var(--site-header-sticky-offset)+1rem)] lg:self-start">
          <Image
            key={activeStage.id}
            src={activeStage.image}
            alt={activeStage.title}
            fill
            sizes="(max-width: 1024px) 100vw, 380px"
            quality={78}
            className="object-cover object-center transition-opacity duration-500 ease-out"
            priority={false}
          />
        </div>
      </div>
    </section>
  );
}

export function CaseStudyLeadCtaSection({
  sectionClassName,
  leadSource: _leadSource = "portfolio-case-cta",
}: {
  sectionClassName?: string;
  /** Зарезервировано под аналитику / бывший источник заявки */
  leadSource?: string;
} = {}) {
  return (
    <section className={sectionClassName ?? "mt-16 md:mt-20"} aria-labelledby="trust-us-heading">
      <TrustLeadCardShell>
        <TrustLeadCardBody variant="standalone" />
      </TrustLeadCardShell>
    </section>
  );
}
