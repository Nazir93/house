import { SITE_NAME, CITY, SITE_URL, buildSchemaAreaServed, getDefaultSiteGeoDescription } from "@/lib/constants";
import { OFFICE_OPENING_HOURS_JSON_LD } from "@/lib/contact-config";
import { loadContactConfig } from "@/lib/load-contact-config";
import { prisma } from "@/lib/db";

async function getDbData() {
  try {
    const [reviews, faqs] = await Promise.all([
      prisma.review.findMany({ where: { visible: true }, orderBy: { order: "asc" }, take: 20 }),
      prisma.faq.findMany({ where: { visible: true }, orderBy: { order: "asc" }, take: 30 }),
    ]);
    return { reviews, faqs };
  } catch {
    return { reviews: [], faqs: [] };
  }
}

export async function JsonLd() {
  const { reviews, faqs } = await getDbData();
  const contact = await loadContactConfig();

  const organization = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: SITE_NAME,
    description: getDefaultSiteGeoDescription(),
    url: SITE_URL,
    telephone: [contact.phoneRaw, contact.phone2Raw],
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: CITY,
      addressCountry: "RU",
      streetAddress: contact.address,
    },
    areaServed: buildSchemaAreaServed(),
    openingHoursSpecification: [OFFICE_OPENING_HOURS_JSON_LD],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Строительство загородных домов",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Проектирование и типовые проекты домов" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Фундамент, коробка, кровля" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Инженерные сети и отделка" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Ипотека и сопровождение сделки" } },
      ],
    },
    ...(reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
      review: reviews.slice(0, 5).map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.authorName },
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
        reviewBody: r.text,
        ...(r.objectName && { itemReviewed: { "@type": "LocalBusiness", name: r.objectName } }),
      })),
    }),
  };

  const schemas: object[] = [organization];

  if (faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
