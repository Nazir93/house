"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicFaqItem } from "@/lib/get-public-faqs";

export function CaseStudyFaqSectionClient({
  items,
  sectionClassName,
}: {
  items: PublicFaqItem[];
  sectionClassName?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className={sectionClassName ?? "mt-16 md:mt-20"} aria-labelledby="case-faq-heading">
      <div className="mb-8 w-full min-w-0 md:mb-9">
        <div className="w-full min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Вопросы клиентов</p>
          <h2
            id="case-faq-heading"
            className="mt-2.5 w-full max-w-none text-balance font-heading text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl md:text-[2.2rem] md:leading-[1.1]"
          >
            Частые вопросы и ответы
          </h2>
          <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-[var(--text-muted)] sm:text-sm">
            Сроки, смета, ипотека и доработки типового проекта — кратко и по делу.
          </p>
        </div>
      </div>

      <div className="grid gap-0 sm:gap-x-10 md:grid-cols-2 md:gap-x-12">
        {items.map((item) => {
          const open = openId === item.id;
          const panelId = `case-faq-panel-${item.id}`;
          return (
            <div key={item.id} className="border-b border-[var(--border)] py-4 md:py-5">
              <button
                type="button"
                id={`case-faq-trigger-${item.id}`}
                onClick={() => setOpenId(open ? null : item.id)}
                className="group flex w-full items-start gap-3 py-1 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] md:gap-4"
                aria-expanded={open}
                aria-controls={panelId}
              >
                <span className="min-w-0 flex-1 font-heading text-[15px] font-semibold leading-snug tracking-tight text-[var(--text)] sm:text-base">
                  {item.q}
                </span>
                <ChevronDown
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform duration-300 ease-out group-hover:text-[var(--text)]",
                    open && "rotate-180 text-[var(--accent)]",
                  )}
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={`case-faq-trigger-${item.id}`}
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="pt-3 pr-8 md:pr-10">
                    <p className="text-[14px] leading-relaxed text-[var(--text-muted)] sm:text-[15px] md:leading-[1.65] whitespace-pre-line">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
