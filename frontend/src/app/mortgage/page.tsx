import { CITY, SITE_NAME } from "@/lib/constants";
import { getPageMeta } from "@/lib/get-page-meta";
import { MortgagePageContent } from "@/components/mortgage/mortgage-page-content";
import { getMortgagePageSettings } from "@/lib/mortgage-settings-config";

export async function generateMetadata() {
  return getPageMeta({
    title: `Ипотека на строительство дома — калькулятор и программы | ${SITE_NAME}`,
    description: `Ипотека на ИЖС и строительство под ключ в ${CITY}: программы, ориентировочный расчёт платежа и заявка. Условия банка уточняются при одобрении.`,
    path: "/mortgage",
    keywords: ["ипотека на строительство дома", "семейная ипотека", "калькулятор ипотеки", CITY, SITE_NAME],
  });
}

export default async function MortgagePage() {
  const mortgageSettings = await getMortgagePageSettings();

  return (
    <section className="page-top-offset pb-20" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <div className="container mx-auto max-w-6xl px-5">
        <span
          className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em]"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          Ипотека
        </span>
        <h1 className="mt-5 font-heading text-4xl md:text-6xl">Ипотека на строительство дома</h1>
        <p className="mt-5 max-w-3xl text-lg" style={{ color: "var(--text-muted)" }}>
          Подберём совместимые программы и поможем собрать документы для банка. Ниже — ориентировочные ставки и калькулятор;
          финальные условия зависят от одобрения и полной стоимости кредита.
        </p>

        <MortgagePageContent settings={mortgageSettings} />
      </div>
    </section>
  );
}
