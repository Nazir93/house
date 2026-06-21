import { getPageMeta } from "@/lib/get-page-meta";
import { getCommercialPageSeo } from "@/lib/seo/commercial-page-seo";
import { JsonLdInline } from "@/components/seo/json-ld-inline";
import { CalculatorPageClient } from "./calculator-page-client";

export async function generateMetadata() {
  const seo = getCommercialPageSeo("calculator");
  return getPageMeta({
    title: seo.title,
    description: seo.description,
    path: seo.path,
    keywords: seo.keywords,
  });
}

export default function CalculatorPage() {
  const seo = getCommercialPageSeo("calculator");

  return (
    <>
      <JsonLdInline
        schema={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: seo.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }}
      />
      <CalculatorPageClient seo={seo} />
    </>
  );
}
