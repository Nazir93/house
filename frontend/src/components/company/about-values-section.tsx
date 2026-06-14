import { CmsImage } from "@/components/ui/cms-image";
import { ABOUT_VALUES } from "@/lib/about-page-copy";

type AboutValuesSectionProps = {
  valuesImageSrc: string;
  valuesImageAlt: string;
};

export function AboutValuesSection({ valuesImageSrc, valuesImageAlt }: AboutValuesSectionProps) {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: "var(--bg-secondary)" }} aria-label="Ценности">
      <div className="container mx-auto max-w-[1200px] px-5">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-12">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.35rem] bg-[var(--card-bg)] lg:sticky lg:top-24 lg:aspect-[3/4]">
            <CmsImage
              src={valuesImageSrc}
              alt={valuesImageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 480px"
            />
          </div>

          <div className="min-w-0">
            <h2 className="font-heading text-2xl font-bold md:text-3xl" style={{ color: "var(--text)" }}>
              {ABOUT_VALUES.title}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5">
              {ABOUT_VALUES.items.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.15rem] border p-5 md:p-6"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--card-bg)" }}
                >
                  <h3 className="font-heading text-lg font-bold md:text-xl" style={{ color: "var(--text)" }}>
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed md:text-[15px]" style={{ color: "var(--text-muted)" }}>
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
