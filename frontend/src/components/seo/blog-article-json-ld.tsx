import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { toAbsoluteSiteUrl } from "@/lib/absolute-site-url";
import { buildBreadcrumbListSchema } from "@/lib/breadcrumb-schema";
import { JsonLdInline } from "./json-ld-inline";

type Props = {
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  galleryUrls: string[];
  datePublished: string;
  dateModified: string;
};

const PUBLISHER_LOGO = toAbsoluteSiteUrl(
  process.env.NEXT_PUBLIC_PUBLISHER_LOGO_URL?.trim() || "/icon.png"
);

export function BlogArticleJsonLd({
  title,
  slug,
  description,
  coverImage,
  galleryUrls,
  datePublished,
  dateModified,
}: Props) {
  const base = SITE_URL.replace(/\/$/, "");
  const pageUrl = `${base}/blog/${slug}`;

  const imageUrls = [coverImage, ...galleryUrls]
    .map((u) => (u ? toAbsoluteSiteUrl(u) : undefined))
    .filter((x): x is string => Boolean(x));

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description.slice(0, 5000),
    ...(imageUrls.length > 0 ? { image: imageUrls } : {}),
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      ...(PUBLISHER_LOGO ? { logo: { "@type": "ImageObject", url: PUBLISHER_LOGO } } : {}),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  };

  const crumbs = buildBreadcrumbListSchema([
    { name: "Главная", path: "/" },
    { name: "Блог", path: "/blog" },
    { name: title, path: `/blog/${slug}` },
  ]);

  return (
    <>
      <JsonLdInline schema={article} />
      <JsonLdInline schema={crumbs} />
    </>
  );
}
