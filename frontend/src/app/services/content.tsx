import { ServicesHub } from "@/components/services/services-hub";
import type { ServiceItem } from "@/lib/get-services";
import { formatArticleBody } from "@/lib/html-content";

export function ServicesPageContent({
  services,
  pageH1,
  introText,
  bodyHtml,
}: {
  services: ServiceItem[];
  pageH1: string;
  introText: string;
  bodyHtml: string | null;
}) {
  return (
    <section className="page-top-offset" style={{ backgroundColor: "var(--bg)" }}>
      <ServicesHub services={services} pageH1={pageH1} introText={introText} />

      {bodyHtml ? (
        <div className="container mx-auto max-w-[900px] px-4 py-12 sm:px-6 lg:px-10">
          <div
            className="prose prose-sm md:prose-base max-w-none border-t border-[var(--border)] pt-12 [&_img]:rounded-md [&_img]:border [&_img]:border-[var(--border)]"
            style={{ color: "var(--text)" }}
            dangerouslySetInnerHTML={{ __html: formatArticleBody(bodyHtml) }}
          />
        </div>
      ) : null}
    </section>
  );
}
