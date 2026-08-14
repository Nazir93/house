import { SITE_NAME, SITE_URL, buildSchemaAreaServed } from "@/lib/constants";
import { buildSelfReferencingCanonical } from "@/lib/seo/self-referencing-canonical";

interface LandingServiceSchemaProps {
  serviceName: string;
  serviceDescription: string;
  slug: string;
  /** Только реальная цена из CMS; без значения — блок offers не выводим (§17). */
  priceRange?: string;
  /** Пустой массив — поле telephone в provider не выводим */
  telephone: string[];
}

export function LandingServiceSchema({
  serviceName,
  serviceDescription,
  slug,
  priceRange,
  telephone,
}: LandingServiceSchemaProps) {
  const tel = telephone.filter((t) => t?.trim());
  const realPrice = priceRange?.trim();
  const serviceUrl = buildSelfReferencingCanonical(slug.startsWith("/") ? slug : `/${slug}`);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceName,
    description: serviceDescription,
    provider: {
      "@type": "GeneralContractor",
      name: SITE_NAME,
      ...(tel.length > 0 ? { telephone: tel } : {}),
      url: buildSelfReferencingCanonical("/"),
      areaServed: buildSchemaAreaServed(),
    },
    areaServed: buildSchemaAreaServed(),
    url: serviceUrl,
    ...(realPrice
      ? {
          offers: {
            "@type": "Offer",
            priceSpecification: {
              "@type": "PriceSpecification",
              priceCurrency: "RUB",
              price: realPrice,
            },
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Главная",
        item: buildSelfReferencingCanonical("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Услуги",
        item: buildSelfReferencingCanonical("/services"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: serviceName,
        item: serviceUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}
