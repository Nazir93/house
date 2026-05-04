import { prisma } from "@/lib/db";

export type HomeBlogPreviewItem = {
  id: string;
  slug: string | null;
  title: string;
  excerpt: string;
};

/** Статические карточки, если БД недоступна или нет опубликованных записей (главная не «пропадает»). */
export const HOME_BLOG_PREVIEW_FALLBACK: HomeBlogPreviewItem[] = [
  {
    id: "fallback-1",
    slug: null,
    title: "Как выбрать типовой проект дома под участок",
    excerpt:
      "Учитываем габариты, инсоляцию, подъезд для техники и будущую инженерию: на что смотреть до покупки проекта.",
  },
  {
    id: "fallback-2",
    slug: null,
    title: "Газобетон, кирпич или керамоблок: что важнее для бюджета",
    excerpt:
      "Сравниваем сроки кладки, теплоизоляцию и типовые узлы для загородного дома без маркетинговых обещаний.",
  },
  {
    id: "fallback-3",
    slug: null,
    title: "Этапы стройки: от фундамента до финальной приёмки",
    excerpt:
      "Короткая дорожная карта: фундамент, коробка, кровля, инженерия, отделка — где чаще всего сдвигаются сроки.",
  },
];

/** Последние опубликованные записи для главной (или статический превью без слага). */
export async function getHomeBlogPreview(take: number): Promise<HomeBlogPreviewItem[]> {
  const limit =
    typeof take === "number" && Number.isFinite(take) ? Math.min(Math.max(1, Math.floor(take)), 12) : 3;

  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, slug: true, title: true, excerpt: true },
    });

    if (posts.length > 0) {
      return posts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
      }));
    }
  } catch {
    // DB unavailable
  }

  const fallback = HOME_BLOG_PREVIEW_FALLBACK.slice(0, limit);
  return fallback.length > 0 ? fallback : HOME_BLOG_PREVIEW_FALLBACK.slice(0, 3);
}
