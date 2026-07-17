import { SITE_NAME, CITY } from "@/lib/constants";
import { getPageMeta } from "@/lib/get-page-meta";
import { Section } from "@/components/ui/section";
import { BackNavLink } from "@/components/ui/back-nav";
import Link from "next/link";
import { Construction } from "lucide-react";

export async function generateMetadata() {
  return getPageMeta({
    title: `Аренда и ремонт | ${SITE_NAME}`,
    description: `Аренда спецтехники и ремонт для партнёров ${SITE_NAME} в ${CITY}. Раздел готовится — оставьте заявку через контакты или партнёрские формы на сайте.`,
    path: "/partners/rent-repair",
    keywords: ["аренда", "ремонт", SITE_NAME, CITY],
  });
}

export default function PartnersRentRepairPage() {
  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      <Section dark className="!pt-8 md:!pt-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <BackNavLink href="/">На главную</BackNavLink>
          </div>

          <header className="mb-8 md:mb-10">
            <p
              className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-heading mb-2.5"
              style={{ color: "var(--text-subtle)" }}
            >
              Партнёрам
            </p>
            <h1
              className="font-heading text-xl sm:text-2xl md:text-[1.7rem] lg:text-[1.85rem] tracking-tight leading-[1.18] max-w-xl"
              style={{ color: "var(--text)" }}
            >
              Аренда и ремонт
            </h1>
            <p
              className="mt-3 text-sm sm:text-[0.9375rem] md:text-base max-w-lg leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              Оборудование и сервис для объекта — раздел скоро пополним материалами.
            </p>
          </header>

          <div
            className="rounded-2xl px-6 py-10 sm:px-10 sm:py-12 text-center"
            style={{
              border: "1px solid var(--border)",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            <div className="flex justify-center mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(15,61,46,0.08)",
                  border: "1px solid rgba(15,61,46,0.2)",
                }}
              >
                <Construction size={26} style={{ color: "var(--accent)" }} aria-hidden />
              </div>
            </div>
            <p className="font-heading text-lg sm:text-xl md:text-2xl mb-2 tracking-tight" style={{ color: "var(--text)" }}>
              Страница в разработке
            </p>
            <p className="text-sm sm:text-base max-w-md mx-auto mb-6 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Скоро здесь появится информация об аренде и ремонте. По срочным вопросам свяжитесь с нами.
            </p>
            <Link
              href="/contacts"
              className="inline-flex text-xs uppercase tracking-[0.15em] underline underline-offset-4"
              style={{ color: "var(--accent)" }}
            >
              Перейти в контакты
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
