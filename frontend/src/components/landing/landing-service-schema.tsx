import { SITE_NAME, SITE_URL, buildSchemaAreaServed } from "@/lib/constants";

interface LandingServiceSchemaProps {
  serviceName: string;
  serviceDescription: string;
  slug: string;
  priceRange?: string;
  /** Пустой массив — поле telephone в provider не выводим */
  telephone: string[];
}

export function LandingServiceSchema({
  serviceName,
  serviceDescription,
  slug,
  priceRange = "от 50 000 ₽",
  telephone,
}: LandingServiceSchemaProps) {
  const tel = telephone.filter((t) => t?.trim());
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: serviceName,
    description: serviceDescription,
    provider: {
      "@type": "HomeBuilder",
      name: SITE_NAME,
      ...(tel.length > 0 ? { telephone: tel } : {}),
      url: SITE_URL,
      areaServed: buildSchemaAreaServed(),
    },
    areaServed: buildSchemaAreaServed(),
    url: `${SITE_URL}${slug}`,
    offers: {
      "@type": "Offer",
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "RUB",
        price: priceRange,
      },
      availability: "https://schema.org/InStock",
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Главная",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Услуги",
        item: `${SITE_URL}/services`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: serviceName,
        item: `${SITE_URL}${slug}`,
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
