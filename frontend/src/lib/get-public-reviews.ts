import { unstable_cache } from "next/cache";
import { CACHE_TAG_PUBLIC_REVIEWS } from "@/lib/cache-tags-public";
import { htmlToPlainText } from "@/lib/html-to-plain-text";
import { prisma } from "@/lib/db";
import { SERVICE_TYPE_LABEL_BY_VALUE } from "@/lib/service-type-admin-options";

export type PublicReviewItem = {
  id: string;
  authorName: string;
  authorPhoto: string | null;
  objectName: string | null;
  serviceLabel: string | null;
  rating: number;
  text: string;
  videoUrl: string | null;
  photoUrls: string[];
};

function serviceLabel(service: string | null): string | null {
  if (!service) return null;
  return SERVICE_TYPE_LABEL_BY_VALUE[service] ?? null;
}

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
          photoUrls: true,
        },
      });
      return rows.map((r) => ({
        id: r.id,
        authorName: r.authorName.trim(),
        authorPhoto: r.authorPhoto,
        objectName: r.objectName,
        serviceLabel: serviceLabel(r.service),
        rating: Math.min(5, Math.max(1, r.rating)),
        text: htmlToPlainText(r.text) || r.text,
        videoUrl: r.videoUrl,
        photoUrls: Array.isArray(r.photoUrls) ? r.photoUrls.filter(Boolean) : [],
      }));
    } catch {
      return [];
    }
  },
  ["public-reviews"],
  { revalidate: 60, tags: [CACHE_TAG_PUBLIC_REVIEWS] }
);
