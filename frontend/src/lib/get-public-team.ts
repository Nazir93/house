import { unstable_cache } from "next/cache";
import { CACHE_TAG_PUBLIC_TEAM } from "@/lib/cache-tags-public";
import { htmlToPlainText } from "@/lib/html-to-plain-text";
import { prisma } from "@/lib/db";

export type PublicTeamMember = {
  id: string;
  name: string;
  position: string;
  photoUrl: string | null;
  description: string | null;
};

export const getPublicTeam = unstable_cache(
  async (): Promise<PublicTeamMember[]> => {
    try {
      const rows = await prisma.teamMember.findMany({
        where: { visible: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          position: true,
          photoUrl: true,
          description: true,
        },
      });
      return rows.map((r) => ({
        id: r.id,
        name: r.name.trim(),
        position: r.position.trim(),
        photoUrl: r.photoUrl,
        description: r.description ? htmlToPlainText(r.description) || r.description : null,
      }));
    } catch {
      return [];
    }
  },
  ["public-team"],
  { revalidate: 60, tags: [CACHE_TAG_PUBLIC_TEAM] }
);
