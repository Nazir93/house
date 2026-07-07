import type { HomePartner } from "@/lib/get-home-partners";
import { TrustLeadCardBody, TrustLeadCardShell } from "@/components/sections/trust-lead-card";
import { CmsImage } from "@/components/ui/cms-image";

function PartnerLogo({ partner }: { partner: HomePartner }) {
  const inner = (
    <div
      className="flex h-24 items-center justify-center rounded-2xl px-4 py-3 transition-opacity duration-300 hover:opacity-90 sm:h-28 md:h-32"
      style={{ border: "1px solid var(--border)", backgroundColor: "color-mix(in srgb, var(--bg) 92%, transparent)" }}
    >
      {partner.logoUrl ? (
        <CmsImage
          src={partner.logoUrl}
          alt={partner.name}
          width={240}
          height={120}
          className="max-h-14 w-auto max-w-full object-contain sm:max-h-16 md:max-h-[4.5rem]"
          sizes="(max-width: 768px) 40vw, 200px"
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

function PartnersGrid({ partners }: { partners: HomePartner[] }) {
  return (
    <div className="mt-10 border-t border-[color-mix(in_srgb,var(--border)_65%,transparent)] pt-8 sm:mt-11 sm:pt-9">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">С кем работаем</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-5">
        {partners.map((p) => (
          <PartnerLogo key={p.id} partner={p} />
        ))}
      </div>
    </div>
  );
}

export function HomePartnersSection({ partners }: { partners: HomePartner[] }) {
  const hasPartners = partners.length > 0;

  return (
    <section
      id="partners"
      className="py-16 sm:py-20 md:py-28"
      style={{ backgroundColor: "var(--bg)", borderTop: "1px solid var(--border)" }}
      aria-labelledby="trust-us-subheading"
    >
      <div className="container mx-auto">
        <TrustLeadCardShell>
          <TrustLeadCardBody
            variant="embedded"
            afterIntro={hasPartners ? <PartnersGrid partners={partners} /> : undefined}
          />
        </TrustLeadCardShell>
      </div>
    </section>
  );
}
