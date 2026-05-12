import { unstable_cache } from "next/cache";
import { CACHE_TAG_PUBLIC_REVIEWS } from "@/lib/cache-tags-public";
import { htmlToPlainText } from "@/lib/html-to-plain-text";
import { prisma } from "@/lib/db";
import { ADMIN_PROJECT_SERVICE_OPTIONS } from "@/lib/admin-service-options";

export type PublicReviewItem = {
  id: string;
  authorName: string;
  authorPhoto: string | null;
  objectName: string | null;
  serviceLabel: string | null;
  rating: number;
  text: string;
  videoUrl: string | null;
};

function serviceLabel(service: string | null): string | null {
  if (!service) return null;
  const opt = ADMIN_PROJECT_SERVICE_OPTIONS.find((o) => o.value === service);
  return opt?.label ?? null;
}

const FALLBACK_REVIEWS: PublicReviewItem[] = [
  {
    id: "demo-1",
    authorName: "Семья Ивановых",
    authorPhoto: null,
    objectName: null,
    serviceLabel: null,
    rating: 5,
    text: "Помогли выбрать проект, адаптировали планировку и поэтапно показывали работы без лишней суеты.",
    videoUrl: null,
  },
  {
    id: "demo-2",
    authorName: "Дом в ЛО",
    authorPhoto: null,
    objectName: null,
    serviceLabel: null,
    rating: 5,
    text: "Сроки и комплектация были понятны до старта строительства — удобно сравнивать с другими подрядчиками.",
    videoUrl: null,
  },
  {
    id: "demo-3",
    authorName: "Частный заказчик",
    authorPhoto: null,
    objectName: null,
    serviceLabel: null,
    rating: 5,
    text: "После экскурсии по объекту проще было решить по материалам и планировке.",
    videoUrl: null,
  },
];

export const getPublicReviews = unstable_cache(
  async (): Promise<PublicReviewItem[]> => {
    try {
      const rows = await prisma.review.findMany({
        where: { visible: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          authorName: true,
          authorPhoto: true,
          objectName: true,
          service: true,
          rating: true,
          text: true,
          videoUrl: true,
        },
      });
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          authorName: r.authorName.trim(),
          authorPhoto: r.authorPhoto,
          objectName: r.objectName,
          serviceLabel: serviceLabel(r.service),
          rating: Math.min(5, Math.max(1, r.rating)),
          text: htmlToPlainText(r.text) || r.text,
          videoUrl: r.videoUrl,
        }));
      }
    } catch {
      /* ignore */
    }
    return FALLBACK_REVIEWS;
  },
  ["public-reviews"],
  { revalidate: 60, tags: [CACHE_TAG_PUBLIC_REVIEWS] }
);
