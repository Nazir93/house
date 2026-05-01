import { SITE_NAME, CITY } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { getPageMeta, getPageMetaFields } from "@/lib/get-page-meta";
import { BlogPageContent } from "./content";

export const revalidate = 60;

export async function generateMetadata() {
  return getPageMeta({
    title: `Новости и статьи — строительство домов | ${SITE_NAME}`,
    description: `Материалы о проектировании и строительстве загородных домов в ${CITY}: этапы работ, выбор проекта, ипотека и практические советы от ${SITE_NAME}.`,
    path: "/blog",
    keywords: [`строительство домов ${CITY}`, "проект дома", "коттедж под ключ", SITE_NAME],
  });
}

const FALLBACK_POSTS = [
  {
    id: "1",
    title: "Как выбрать типовой проект дома под участок",
    excerpt:
      "Учитываем габариты, инсоляцию, подъезд для техники и будущую инженерию: на что смотреть до покупки проекта.",
    category: "Проекты",
    date: "12.02.2026",
  },
  {
    id: "2",
    title: "Газобетон, кирпич или керамоблок: что важнее для бюджета",
    excerpt:
      "Сравниваем сроки кладки, теплоизоляцию и типовые узлы для загородного дома без маркетинговых обещаний.",
    category: "Технологии",
    date: "05.02.2026",
  },
  {
    id: "3",
    title: "Этапы стройки: от фундамента до финальной приёмки",
    excerpt:
      "Короткая дорожная карта: фундамент, коробка, кровля, инженерия, отделка — где чаще всего сдвигаются сроки.",
    category: "Стройка",
    date: "28.01.2026",
  },
  {
    id: "4",
    title: "Ипотека на строительство дома: что подготовить банку",
    excerpt:
      "Проект, смета, права на участок и график работ — какие документы обычно запрашивают на одобрение.",
    category: "Финансы",
    date: "20.01.2026",
  },
];

async function getPosts() {
  try {
    const dbPosts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });

    if (dbPosts.length > 0) {
      return dbPosts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        date: p.createdAt.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }),
      }));
    }
  } catch {
    // DB not available
  }
  return FALLBACK_POSTS;
}

const BLOG_INTRO_FALLBACK =
  "Статьи и новости о проектировании и строительстве загородных домов: материалы, этапы работ и практические советы.";

export default async function BlogPage() {
  const [posts, meta] = await Promise.all([getPosts(), getPageMetaFields("/blog")]);

  return (
    <BlogPageContent
      posts={posts}
      pageH1={meta.h1 || "Новости и статьи"}
      introText={meta.description || BLOG_INTRO_FALLBACK}
      bodyHtml={meta.bodyHtml}
    />
  );
}
