import type { HomePartner } from "@/lib/get-home-partners";
import { CmsImage } from "@/components/ui/cms-image";

function MarqueeItem({ partner }: { partner: HomePartner }) {
  const content = (
    <span className="inline-flex items-center gap-3 whitespace-nowrap rounded-xl border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] px-5 py-3 shadow-sm">
      {partner.logoUrl ? (
        <CmsImage
          src={partner.logoUrl}
          alt={partner.name}
          width={140}
          height={36}
          className="h-7 w-auto max-w-[140px] object-contain opacity-90 sm:h-8"
          sizes="140px"
        />
      ) : (
        <span className="font-heading text-sm font-semibold tracking-tight text-[var(--text)] sm:text-base">
          {partner.name}
        </span>
      )}
    </span>
  );

  if (partner.website?.trim()) {
    return (
      <a
        href={partner.website}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        {content}
      </a>
    );
  }

  return <span className="shrink-0">{content}</span>;
}

export function BankPartnersMarqueeSection({ partners }: { partners: HomePartner[] }) {
  if (partners.length === 0) return null;

  const stripClass = "flex shrink-0 items-center gap-6 pr-6 sm:gap-10 sm:pr-10";

  return (
    <section
      className="border-b border-[var(--border)] pb-9 pt-2 md:pb-11 md:pt-3"
      aria-labelledby="bank-partners-marquee-heading"
    >
      <p
        id="bank-partners-marquee-heading"
        className="mb-5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)] sm:mb-6"
      >
        Наши партнёры:
      </p>
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-partner-marquee motion-reduce:animate-none">
          <div className={stripClass}>
            {partners.map((p) => (
              <MarqueeItem key={p.id} partner={p} />
            ))}
          </div>
          <div className={stripClass} aria-hidden>
            {partners.map((p) => (
              <MarqueeItem key={`${p.id}-dup`} partner={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
