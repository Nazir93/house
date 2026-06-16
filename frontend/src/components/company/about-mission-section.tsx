import { CmsImage } from "@/components/ui/cms-image";
import { ABOUT_MISSION } from "@/lib/about-page-copy";
import { cn } from "@/lib/utils";

type AboutMissionSectionProps = {
  backgroundSrc: string;
  backgroundAlt: string;
};

export function AboutMissionSection({ backgroundSrc, backgroundAlt }: AboutMissionSectionProps) {
  return (
    <section className="relative isolate min-h-[min(72vh,640px)] overflow-hidden" aria-label="Миссия">
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
        className={cn(
          "absolute inset-0",
          "bg-gradient-to-r from-black/82 via-black/68 to-black/78",
          "dark:bg-none dark:[background:linear-gradient(105deg,rgba(12,15,13,0.88)_0%,rgba(12,15,13,0.72)_48%,rgba(12,15,13,0.55)_100%)]"
        )}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25 dark:from-black/45 dark:to-black/35"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-[min(72vh,640px)] items-center py-16 md:py-24">
        <div className="container mx-auto max-w-[1200px] px-5">
          <div className="max-w-3xl">
            <h2
              className={cn(
                "font-heading text-[clamp(1.5rem,3.2vw,2.5rem)] font-bold leading-[1.18] tracking-tight text-white",
                "[text-shadow:0_1px_2px_rgba(0,0,0,0.55),0_2px_16px_rgba(0,0,0,0.35)]"
              )}
            >
              {ABOUT_MISSION.heading}
            </h2>
            <div
              className={cn(
                "mt-6 space-y-4 rounded-xl px-4 py-4 text-[15px] leading-relaxed md:px-5 md:py-5 md:text-base",
                "bg-black/52 text-neutral-100 shadow-[0_12px_40px_rgba(0,0,0,0.32)] backdrop-blur-sm",
                "dark:bg-transparent dark:p-0 dark:shadow-none dark:backdrop-blur-none dark:text-white/82"
              )}
            >
              {ABOUT_MISSION.paragraphs.map((p) => (
                <p
                  key={p.slice(0, 24)}
                  className="[text-shadow:0_1px_2px_rgba(0,0,0,0.45)] dark:[text-shadow:none]"
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
