import { SITE_NAME, CITY, SITE_URL, buildSchemaAreaServed, getDefaultSiteGeoDescription } from "@/lib/constants";
import { toAbsoluteSiteUrl } from "@/lib/absolute-site-url";
import { OFFICE_OPENING_HOURS_JSON_LD } from "@/lib/contact-config";
import { loadContactConfig } from "@/lib/load-contact-config";
import { maxMessengerChatUrl } from "@/lib/messenger-links";
import { htmlToPlainText } from "@/lib/html-to-plain-text";
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

  const tel = [contact.phoneRaw, contact.phone2Raw].filter((t) => t?.trim());
  const maxProfileUrl = maxMessengerChatUrl(contact.social.max);
  const sameAs = [contact.social.telegram, contact.social.vk, maxProfileUrl].filter((u) => u?.trim());
  const logoUrl = toAbsoluteSiteUrl(
    process.env.NEXT_PUBLIC_PUBLISHER_LOGO_URL?.trim() || "/icon.png"
  );

  const organization = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: SITE_NAME,
    description: getDefaultSiteGeoDescription(),
    url: SITE_URL,
    ...(logoUrl
      ? {
          logo: {
            "@type": "ImageObject",
            url: logoUrl,
          },
        }
      : {}),
    ...(tel.length > 0 ? { telephone: tel } : {}),
    ...(contact.email.trim() ? { email: contact.email.trim() } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: CITY,
      addressCountry: "RU",
      ...(contact.address.trim() ? { streetAddress: contact.address.trim() } : {}),
    },
    areaServed: buildSchemaAreaServed(),
    ...(sameAs.length > 0 ? { sameAs } : {}),
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
        reviewBody: htmlToPlainText(r.text) || r.text,
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
        name: htmlToPlainText(f.question) || f.question,
        acceptedAnswer: { "@type": "Answer", text: htmlToPlainText(f.answer) || f.answer },
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
