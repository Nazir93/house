import { prisma } from "@/lib/db";

export type HomePartner = {
  id: string;
  name: string;
  logoUrl: string;
  website: string | null;
};

export async function getHomePartners(): Promise<HomePartner[]> {
  try {
    return await prisma.partner.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true, logoUrl: true, website: true },
    });
  } catch {
    return [];
  }
}
