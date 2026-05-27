import { prisma } from "@/lib/db";

export type AdminHouseProjectOption = {
  id: string;
  slug: string;
  title: string;
  rooms: number;
  bathrooms: number;
  area: number;
  published: boolean;
};

export async function loadAdminHouseProjectOptions(): Promise<AdminHouseProjectOption[]> {
  try {
    const rows = await (prisma as any).houseProject.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        rooms: true,
        bathrooms: true,
        area: true,
        published: true,
      },
      orderBy: [{ title: "asc" }],
    });
    return rows as AdminHouseProjectOption[];
  } catch {
    return [];
  }
}
