import { revalidatePath } from "next/cache";
import { revalidateTagWithProfile } from "@/lib/revalidate-tag";
import {
  CACHE_TAG_PUBLIC_BUILT_OBJECTS,
  CACHE_TAG_PUBLIC_FAQS,
  CACHE_TAG_PUBLIC_HOUSE_PROJECTS,
  CACHE_TAG_PUBLIC_REVIEWS,
  CACHE_TAG_PUBLIC_TEAM,
  CACHE_TAG_PUBLIC_VACANCIES,
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

/** После изменений вакансий. */
export function revalidatePublicVacancies(): void {
  revalidateTagWithProfile(CACHE_TAG_PUBLIC_VACANCIES);
  revalidatePath("/partners/vacancies");
}

/**
 * После изменений типовых проектов домов и/или построенных объектов в админке:
 * сброс `unstable_cache` в `construction-data` и страниц, где показываются каталоги и превью.
 */
export function revalidatePublicConstructionCatalog(): void {
  revalidateTagWithProfile(CACHE_TAG_PUBLIC_HOUSE_PROJECTS);
  revalidateTagWithProfile(CACHE_TAG_PUBLIC_BUILT_OBJECTS);
  revalidatePath("/", "layout");
  revalidatePath("/projects");
  revalidatePath("/typical-projects");
  revalidatePath("/portfolio");
  revalidatePath("/portfolio/under-construction");
  revalidatePath("/portfolio/map");
}
