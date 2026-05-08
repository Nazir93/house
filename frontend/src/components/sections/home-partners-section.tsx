import type { HomePartner } from "@/lib/get-home-partners";
import { TrustLeadCardBody, TrustLeadCardShell } from "@/components/sections/trust-lead-card";

function PartnerLogo({ partner }: { partner: HomePartner }) {
  const inner = (
    <div
      className="flex h-24 items-center justify-center rounded-2xl px-4 py-3 transition-opacity duration-300 hover:opacity-90 sm:h-28 md:h-32"
      style={{ border: "1px solid var(--border)", backgroundColor: "color-mix(in srgb, var(--bg) 92%, transparent)" }}
    >
      {partner.logoUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={partner.logoUrl}
          alt={partner.name}
          className="max-h-14 w-auto max-w-full object-contain sm:max-h-16 md:max-h-[4.5rem]"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] sm:text-xs">
          {partner.name}
        </span>
      )}
    </div>
  );

  if (partner.website?.trim()) {
    return (
      <a href={partner.website} target="_blank" rel="noopener noreferrer" className="block" aria-label={`Сайт партнёра: ${partner.name}`}>
        {inner}
      </a>
    );
  }

  return inner;
}

export function HomePartnersSection({ partners }: { partners: HomePartner[] }) {
  const hasPartners = partners.length > 0;

  return (
    <section
      id="partners"
      className="py-16 sm:py-20 md:py-28"
      style={{ backgroundColor: "var(--bg)", borderTop: "1px solid var(--border)" }}
      aria-labelledby="partners-trust-heading"
    >
      <div className="container mx-auto">
        <TrustLeadCardShell>
          <div className="mb-8 flex flex-col gap-3 border-b border-[color-mix(in_srgb,var(--border)_65%,transparent)] pb-8 md:mb-10 md:pb-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
              Надёжные партнёры · нам доверяют
            </p>
            <h2
              id="partners-trust-heading"
              className="max-w-4xl text-balance font-heading text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl md:text-[2.35rem] md:leading-[1.1]"
            >
              Проверенные бренды и&nbsp;тысячи семей, которые выбрали честную стройку
            </h2>
            <p className="max-w-2xl text-[13px] leading-relaxed text-[var(--text-muted)] sm:text-sm">
              Поставщики и подрядчики с прозрачными условиями — и клиенты, для которых мы ведём объект от проекта до сдачи.
            </p>
          </div>

          {hasPartners ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">С кем работаем</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-5">
                {partners.map((p) => (
                  <PartnerLogo key={p.id} partner={p} />
                ))}
              </div>
              <div
                className="my-10 h-px w-full md:my-11"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, color-mix(in srgb, var(--accent) 35%, var(--border)), transparent)",
                }}
                aria-hidden
              />
            </>
          ) : null}

          <TrustLeadCardBody variant="embedded" />
        </TrustLeadCardShell>
      </div>
    </section>
  );
}
