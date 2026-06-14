import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CmsImage } from "@/components/ui/cms-image";
import { ABOUT_FOUNDER } from "@/lib/about-page-copy";

type AboutFounderSectionProps = {
  founderImageSrc: string;
  founderImageAlt: string;
};

export function AboutFounderSection({ founderImageSrc, founderImageAlt }: AboutFounderSectionProps) {
  return (
    <section className="py-12 md:py-16 lg:py-20" style={{ backgroundColor: "var(--bg-secondary)" }} aria-label="Кто мы">
      <div className="container mx-auto max-w-[1200px] px-5">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="relative aspect-[4/5] min-h-[320px] overflow-hidden rounded-[1.35rem] bg-[var(--card-bg)] sm:aspect-[5/4] lg:aspect-[4/5]">
            <CmsImage
              src={founderImageSrc}
              alt={founderImageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 540px"
              priority
            />
            <div
              className="absolute inset-x-0 bottom-0 p-4 sm:p-5 md:p-6"
              aria-label="Основатель компании"
            >
              <div
                className="rounded-xl border px-4 py-3 backdrop-blur-md sm:px-5 sm:py-4"
                style={{
                  borderColor: "rgba(255,255,255,0.22)",
                  backgroundColor: "rgba(15, 61, 46, 0.82)",
                }}
              >
                <p className="font-heading text-base font-bold text-white sm:text-lg">{ABOUT_FOUNDER.cardName}</p>
                <p className="mt-1 text-sm text-white/85 sm:text-[15px]">{ABOUT_FOUNDER.cardRole}</p>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <h2
              className="font-heading text-[clamp(1.35rem,2.8vw,2.15rem)] font-bold leading-[1.2] tracking-tight"
              style={{ color: "var(--text)" }}
            >
              {ABOUT_FOUNDER.heading}
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
              {ABOUT_FOUNDER.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <nav className="mt-8 flex flex-wrap gap-3" aria-label="Действия">
              {ABOUT_FOUNDER.ctas.map((cta, i) => (
                <Link
                  key={cta.href}
                  href={cta.href}
                  className={
                    i === 0
                      ? "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition hover:opacity-95"
                      : "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  }
                  style={
                    i === 0
                      ? { backgroundColor: "var(--accent)", color: "var(--accent-contrast)" }
                      : { borderColor: "var(--border)", color: "var(--text)" }
                  }
                >
                  {cta.label}
                  <ArrowRight size={16} aria-hidden />
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
