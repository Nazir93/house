import { SITE_NAME, CITY } from "@/lib/constants";
import { getPageMeta } from "@/lib/get-page-meta";
import { CompanyPageHeader } from "@/components/company/company-page-header";
import { ContactsSection } from "@/components/sections/contacts";

export async function generateMetadata() {
  return getPageMeta({
    title: `Контакты | ${SITE_NAME}`,
    description: `Свяжитесь с ${SITE_NAME}: телефон, email, офис в ${CITY}. Заявка на консультацию по строительству дома.`,
    path: "/contacts",
    keywords: [`контакты ${SITE_NAME}`, `строительство дома ${CITY}`, "заявка"],
  });
}

export default function ContactsPage() {
  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      <CompanyPageHeader
        breadcrumbCurrent="Контакты"
        title="Контакты"
        description={`Телефон, email и офис в ${CITY}. Ответим по проектам, срокам и стоимости.`}
      />
      <ContactsSection embedded />
    </div>
  );
}
