import { SITE_NAME, CITY } from "@/lib/constants";
import { getPageMeta } from "@/lib/get-page-meta";
import { PartnerFeedbackForm } from "@/components/partners/partner-feedback-form";

export async function generateMetadata() {
  return getPageMeta({
    title: `Стать партнёром | ${SITE_NAME}`,
    description: `Партнёрство и подряд: ${SITE_NAME}, ${CITY}. Заполните форму — обсудим условия сотрудничества.`,
    path: "/partners/partner",
    keywords: ["партнёр строительство домов", "подрядчик коттедж", SITE_NAME, CITY],
  });
}

export default function PartnersPartnerPage() {
  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      <PartnerFeedbackForm
        title="Стать партнёром"
        subtitle="Расскажите о вашем опыте и формате работы — мы ответим по сотрудничеству и подряду."
        source="partner-partner"
        service="Стать партнёром"
        topic="Стать партнёром"
      />
    </div>
  );
}
