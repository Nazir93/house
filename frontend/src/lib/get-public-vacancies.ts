import { unstable_cache } from "next/cache";
import { CACHE_TAG_PUBLIC_VACANCIES } from "@/lib/cache-tags-public";
import { htmlToPlainText } from "@/lib/html-to-plain-text";
import { prisma } from "@/lib/db";

export type PublicVacancy = {
  id: string;
  title: string;
  location: string | null;
  schedule: string | null;
  salaryLabel: string | null;
  description: string;
  requirements: string | null;
};

function plainField(value: string | null): string | null {
  if (!value) return null;
  const plain = htmlToPlainText(value) || value;
  const trimmed = plain.trim();
  return trimmed || null;
}

export const getPublicVacancies = unstable_cache(
  async (): Promise<PublicVacancy[]> => {
    try {
      const rows = await prisma.vacancy.findMany({
        where: { visible: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          location: true,
          schedule: true,
          salaryLabel: true,
          description: true,
          requirements: true,
        },
      });
      return rows.map((r) => ({
        id: r.id,
        title: r.title.trim(),
        location: plainField(r.location),
        schedule: plainField(r.schedule),
        salaryLabel: plainField(r.salaryLabel),
        description: plainField(r.description) ?? r.description.trim(),
        requirements: plainField(r.requirements),
      }));
    } catch {
      return [];
    }
  },
  ["public-vacancies"],
  { revalidate: 60, tags: [CACHE_TAG_PUBLIC_VACANCIES] }
);
