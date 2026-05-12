import { revalidatePath } from "next/cache";
import { revalidateTagWithProfile } from "@/lib/revalidate-tag";
import {
  CACHE_TAG_PUBLIC_FAQS,
  CACHE_TAG_PUBLIC_REVIEWS,
  CACHE_TAG_PUBLIC_TEAM,
} from "@/lib/cache-tags-public";

/** После изменений FAQ в админке: сброс кэша данных и страниц, где блок FAQ показывается. */
export function revalidatePublicFaqs(): void {
  revalidateTagWithProfile(CACHE_TAG_PUBLIC_FAQS);
  revalidatePath("/", "layout");
  revalidatePath("/portfolio", "layout");
}

/** После изменений отзывов. */
export function revalidatePublicReviews(): void {
  revalidateTagWithProfile(CACHE_TAG_PUBLIC_REVIEWS);
  revalidatePath("/reviews");
  /** aggregateRating и блок Review в JSON-LD на всех страницах */
  revalidatePath("/", "layout");
}

/** После изменений команды. */
export function revalidatePublicTeam(): void {
  revalidateTagWithProfile(CACHE_TAG_PUBLIC_TEAM);
  revalidatePath("/team");
}
