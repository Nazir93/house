"use client";

const TRUST_PHRASES = [
  "Качество материалов",
  "Понятная смета",
  "Ответственный прораб",
  "Гарантия на работы",
];

export function PartnersSection() {
  return (
    <section
      id="partners"
      style={{ backgroundColor: "var(--bg)", borderTop: "1px solid var(--border)" }}
    >
      <div className="container mx-auto max-w-[960px] px-5 py-10 sm:py-12 md:py-14">
        <ul className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {TRUST_PHRASES.map((item) => (
            <li
              key={item}
              className="rounded-2xl border px-5 py-4 text-center font-heading text-[15px] font-semibold leading-snug tracking-wide md:text-base"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
      <p
        className="border-t px-5 py-6 text-center text-xs sm:text-sm leading-relaxed sm:px-8"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        Поставщики кровельных, фасадных и инженерных систем — по проекту; конкретные бренды согласуем на этапе сметы.
      </p>
    </section>
  );
}
