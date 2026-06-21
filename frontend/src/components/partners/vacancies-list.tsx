"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, ChevronDown, MapPin, Clock, Wallet } from "lucide-react";

import type { PublicVacancy } from "@/lib/get-public-vacancies";
import { getVacancyMetaChips } from "@/lib/vacancy-public";
import { VacancyResponseModal } from "@/components/partners/vacancy-response-modal";

const CHIP_ICONS: Record<string, typeof MapPin> = {
  location: MapPin,
  schedule: Clock,
  salary: Wallet,
};

function VacancyEmptyState() {
  return (
    <div
      className="rounded-2xl px-5 py-10 text-center sm:px-10 sm:py-14"
      style={{
        border: "1px solid var(--border)",
        backgroundColor: "var(--card-bg)",
      }}
    >
      <div className="mb-6 flex justify-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: "rgba(15,61,46,0.08)",
            border: "1px solid rgba(15,61,46,0.2)",
          }}
        >
          <Briefcase size={26} style={{ color: "var(--accent)" }} aria-hidden />
        </div>
      </div>
      <p className="font-heading text-xl sm:text-2xl" style={{ color: "var(--text)" }}>
        Сейчас нет открытых вакансий
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
        Следите за обновлениями или отправьте резюме через{" "}
        <Link href="/contacts" className="font-medium underline-offset-4 hover:underline" style={{ color: "var(--accent)" }}>
          контакты
        </Link>
        — мы сохраним его и свяжемся при появлении подходящей позиции.
      </p>
    </div>
  );
}

export function VacanciesList({ vacancies }: { vacancies: PublicVacancy[] }) {
  const [responseVacancy, setResponseVacancy] = useState<PublicVacancy | null>(null);

  if (vacancies.length === 0) {
    return <VacancyEmptyState />;
  }

  return (
    <>
      <div className="space-y-4 md:space-y-5">
        <p className="text-sm sm:text-[15px]" style={{ color: "var(--text-muted)" }}>
          Открытых позиций:{" "}
          <span className="font-semibold tabular-nums" style={{ color: "var(--text)" }}>
            {vacancies.length}
          </span>
        </p>

        <ul className="space-y-3 md:space-y-4" role="list">
          {vacancies.map((vacancy, index) => {
            const chips = getVacancyMetaChips(vacancy);
            const openByDefault = index === 0;

            return (
              <li
                key={vacancy.id}
                className="overflow-hidden rounded-2xl border"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
              >
                <details className="group" open={openByDefault}>
                  <summary className="flex cursor-pointer list-none flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5 sm:py-5 [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-base font-bold leading-snug sm:text-lg" style={{ color: "var(--text)" }}>
                        {vacancy.title}
                      </p>
                      {chips.length > 0 ? (
                        <ul className="mt-2.5 flex flex-wrap gap-2">
                          {chips.map((chip) => {
                            const Icon = CHIP_ICONS[chip.key] ?? MapPin;
                            return (
                              <li
                                key={chip.key}
                                className="inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:text-xs"
                                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                              >
                                <Icon size={13} className="shrink-0 opacity-70" aria-hidden />
                                <span className="truncate">{chip.label}</span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : null}
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center gap-1 self-start text-xs font-semibold uppercase tracking-wide sm:mt-1"
                      style={{ color: "var(--accent)" }}
                    >
                      Подробнее
                      <ChevronDown
                        size={16}
                        className="transition-transform duration-200 group-open:rotate-180"
                        aria-hidden
                      />
                    </span>
                  </summary>

                  <div
                    className="border-t px-4 pb-4 pt-1 sm:px-5 sm:pb-5"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="space-y-4 text-sm leading-relaxed sm:text-[15px]" style={{ color: "var(--text-muted)" }}>
                      <div>
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text)" }}>
                          Описание
                        </p>
                        <p className="whitespace-pre-line">{vacancy.description}</p>
                      </div>
                      {vacancy.requirements ? (
                        <div>
                          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--text)" }}>
                            Требования
                          </p>
                          <p className="whitespace-pre-line">{vacancy.requirements}</p>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        onClick={() => setResponseVacancy(vacancy)}
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] transition hover:opacity-95"
                        style={{ backgroundColor: "var(--accent)" }}
                      >
                        Откликнуться
                        <ArrowRight size={16} aria-hidden />
                      </button>
                      <Link
                        href="/contacts"
                        className="inline-flex min-h-[44px] items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        style={{ borderColor: "var(--border)", color: "var(--text)" }}
                      >
                        Все контакты
                      </Link>
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </div>

      <VacancyResponseModal
        open={responseVacancy != null}
        position={responseVacancy?.title ?? ""}
        onClose={() => setResponseVacancy(null)}
      />
    </>
  );
}
