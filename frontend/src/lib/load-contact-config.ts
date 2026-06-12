import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { createDefaultContactConfig, type ContactConfig } from "@/lib/contact-config";

const KEYS = [
  "phone",
  "phone_raw",
  "phone2",
  "phone2_raw",
  "email",
  "address",
  "working_hours",
  "social_telegram",
  "social_vk",
  "social_max",
  "social_max_chat",
  "company_full_name",
  "company_short_name",
  "company_inn",
  "company_ogrnip",
  "company_postal_address",
  "bank_name",
  "bank_account",
  "bank_corr_account",
  "bank_bic",
] as const;

const loadContactConfigCached = unstable_cache(
  async (): Promise<ContactConfig> => {
    const d = createDefaultContactConfig();
    try {
      const rows = await prisma.siteSettings.findMany({
        where: { key: { in: [...KEYS] } },
      });
      const m = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string>;
      if (m.phone?.trim()) d.phone = m.phone.trim();
      if (m.phone_raw?.trim()) d.phoneRaw = m.phone_raw.trim();
      if (m.phone2?.trim()) d.phone2 = m.phone2.trim();
      if (m.phone2_raw?.trim()) d.phone2Raw = m.phone2_raw.trim();
      if (m.email?.trim()) d.email = m.email.trim();
      if (m.address?.trim()) d.address = m.address.trim();
      if (m.working_hours?.trim()) d.workingHours = m.working_hours.trim();
      if (m.social_telegram?.trim()) d.social.telegram = m.social_telegram.trim();
      if (m.social_vk?.trim()) d.social.vk = m.social_vk.trim();
      if (m.social_max?.trim()) d.social.max = m.social_max.trim();
      if (m.social_max_chat?.trim()) d.social.maxChat = m.social_max_chat.trim();
      if (m.company_full_name?.trim()) d.company.fullName = m.company_full_name.trim();
      if (m.company_short_name?.trim()) d.company.shortName = m.company_short_name.trim();
      if (m.company_inn?.trim()) d.company.inn = m.company_inn.trim();
      if (m.company_ogrnip?.trim()) d.company.ogrnip = m.company_ogrnip.trim();
      if (m.company_postal_address?.trim()) d.company.postalAddress = m.company_postal_address.trim();
      if (m.bank_name?.trim()) d.company.bank.name = m.bank_name.trim();
      if (m.bank_account?.trim()) d.company.bank.account = m.bank_account.trim();
      if (m.bank_corr_account?.trim()) d.company.bank.corrAccount = m.bank_corr_account.trim();
      if (m.bank_bic?.trim()) d.company.bank.bic = m.bank_bic.trim();
    } catch {
      /* БД недоступна — дефолты */
    }
    return d;
  },
  ["contact-config"],
  { revalidate: 60 }
);

/** Подмешивает значения из siteSettings поверх дефолтов из constants. Кэш 60 с — без force-dynamic по всему сайту. */
export async function loadContactConfig(): Promise<ContactConfig> {
  return loadContactConfigCached();
}
