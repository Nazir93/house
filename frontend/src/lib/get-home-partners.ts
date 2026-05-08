import { prisma } from "@/lib/db";

export type HomePartner = {
  id: string;
  name: string;
  logoUrl: string | null;
  website: string | null;
};

/** Показываем на главной, если в БД ещё нет партнёров с лентой (миграция / прод без данных). */
const BANK_MARQUEE_FALLBACK: HomePartner[] = [
  { id: "fb-sber", name: "Сбербанк", logoUrl: null, website: "https://www.sberbank.ru" },
  { id: "fb-alfa", name: "Альфа-Банк", logoUrl: null, website: "https://alfabank.ru" },
  { id: "fb-vtb", name: "ВТБ", logoUrl: null, website: "https://www.vtb.ru" },
  { id: "fb-rshb", name: "Россельхозбанк", logoUrl: null, website: "https://www.rshb.ru" },
  { id: "fb-dom", name: "Дом.РФ", logoUrl: null, website: "https://дом.рф/" },
  { id: "fb-ros", name: "Росбанк", logoUrl: null, website: "https://www.rosbank.ru" },
  { id: "fb-pb", name: "Почта Банк", logoUrl: null, website: "https://www.pochtabank.ru" },
];

export async function getHomePartners(): Promise<HomePartner[]> {
  try {
    return await prisma.partner.findMany({
      where: { visible: true, showInTrustBlock: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true, logoUrl: true, website: true },
    });
  } catch {
    return [];
  }
}

export async function getBankMarqueePartners(): Promise<HomePartner[]> {
  try {
    const rows = await prisma.partner.findMany({
      where: { visible: true, showInBankMarquee: true },
      orderBy: { order: "asc" },
      select: { id: true, name: true, logoUrl: true, website: true },
    });
    if (rows.length > 0) {
      return rows;
    }
  } catch {
    // БД недоступна, нет колонок после деплоя без migrate — показываем запасной список
  }
  return BANK_MARQUEE_FALLBACK;
}
