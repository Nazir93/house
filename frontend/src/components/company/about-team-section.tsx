import { Users } from "lucide-react";
import { CmsImage } from "@/components/ui/cms-image";
import { ABOUT_TEAM } from "@/lib/about-page-copy";

type AboutTeamSectionProps = {
  teamImageSrc: string | null;
  teamImageAlt: string;
};

export function AboutTeamSection({ teamImageSrc, teamImageAlt }: AboutTeamSectionProps) {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: "var(--bg)" }} aria-label="Команда проекта">
      <div className="container mx-auto max-w-[1200px] px-5">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
          <div className="min-w-0">
            <p
              className="font-heading text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--accent)" }}
            >
              {ABOUT_TEAM.sectionTitle}
            </p>
            <h2
              className="mt-3 font-heading text-2xl font-bold leading-tight tracking-tight md:text-3xl lg:text-[2rem]"
              style={{ color: "var(--text)" }}
            >
              {ABOUT_TEAM.lead}
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed md:text-base" style={{ color: "var(--text-muted)" }}>
              {ABOUT_TEAM.body}
            </p>
          </div>

          {teamImageSrc ? (
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.35rem] bg-[var(--card-bg)] lg:aspect-[4/3]">
              <CmsImage
                src={teamImageSrc}
                alt={teamImageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 560px"
              />
            </div>
          ) : (
            <div
              className="flex aspect-[16/10] flex-col items-center justify-center gap-3 rounded-[1.35rem] border lg:aspect-[4/3]"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
            >
              <Users size={40} className="opacity-35" style={{ color: "var(--accent)" }} aria-hidden />
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                {ABOUT_TEAM.photoPlaceholder}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
