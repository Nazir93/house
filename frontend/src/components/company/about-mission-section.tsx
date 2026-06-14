import { CmsImage } from "@/components/ui/cms-image";
import { ABOUT_MISSION } from "@/lib/about-page-copy";

type AboutMissionSectionProps = {
  backgroundSrc: string;
  backgroundAlt: string;
};

export function AboutMissionSection({ backgroundSrc, backgroundAlt }: AboutMissionSectionProps) {
  return (
    <section className="relative min-h-[min(72vh,640px)] overflow-hidden" aria-label="Миссия">
      <div className="absolute inset-0">
        <CmsImage
          src={backgroundSrc}
          alt={backgroundAlt}
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(12, 15, 13, 0.88) 0%, rgba(12, 15, 13, 0.72) 48%, rgba(12, 15, 13, 0.55) 100%)",
        }}
        aria-hidden
      />
      <div className="relative flex min-h-[min(72vh,640px)] items-center py-16 md:py-24">
        <div className="container mx-auto max-w-[1200px] px-5">
          <div className="max-w-3xl">
            <h2
              className="font-heading text-[clamp(1.5rem,3.2vw,2.5rem)] font-bold leading-[1.18] tracking-tight text-white"
            >
              {ABOUT_MISSION.heading}
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-white/82 md:text-base">
              {ABOUT_MISSION.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
