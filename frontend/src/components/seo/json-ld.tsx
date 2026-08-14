import { toAbsoluteSiteUrl } from "@/lib/absolute-site-url";
import { loadContactConfig } from "@/lib/load-contact-config";
import { maxMessengerChannelUrl } from "@/lib/messenger-links";
import { SITE_DEFAULT_ICON_PATH } from "@/lib/pwa-config";
import { buildGeneralContractorJsonLd } from "@/lib/seo/general-contractor-json-ld";

/**
 * Sitewide JSON-LD компании на всех страницах (ТЗ SEO §17).
 * FAQ / отзывы / офферы здесь не размещаем — только GeneralContractor.
 */
export async function JsonLd() {
  const contact = await loadContactConfig();

  const maxChannelUrl = maxMessengerChannelUrl(contact.social.max);
  const sameAs = [contact.social.telegram, contact.social.vk, maxChannelUrl].filter(
    (u): u is string => Boolean(u?.trim()),
  );
  const logoUrl = toAbsoluteSiteUrl(
    process.env.NEXT_PUBLIC_PUBLISHER_LOGO_URL?.trim() || SITE_DEFAULT_ICON_PATH,
  );

  const organization = buildGeneralContractorJsonLd({
    phone: contact.phone,
    phone2: contact.phone2,
    email: contact.email,
    address: contact.address,
    sameAs,
    logoUrl,
    includeAreaServed: true,
    includeOpeningHours: true,
    includeDescription: true,
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
    />
  );
}
