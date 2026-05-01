import { SITE_NAME, CITY } from "@/lib/constants";
import { getPageMeta } from "@/lib/get-page-meta";
import { PartnerFeedbackForm } from "@/components/partners/partner-feedback-form";

export async function generateMetadata() {
  return getPageMeta({
    title: `Стать поставщиком | ${SITE_NAME}`,
    description: `Заявка для поставщиков: ${SITE_NAME}, ${CITY}. Оставьте контакты и краткое описание — свяжемся с вами.`,
    path: "/partners/supplier",
    keywords: ["поставщик стройматериалов", "партнёр застройщик", SITE_NAME, CITY],
  });
}

export default function PartnersSupplierPage() {
  return (
    <div style={{ backgroundColor: "var(--bg)" }}>
      <PartnerFeedbackForm
        title="Стать поставщиком"
        subtitle="Оставьте заявку — мы свяжемся с вами по вопросам поставок и сотрудничества."
        source="partner-supplier"
        service="Стать поставщиком"
        topic="Стать поставщиком"
      />
    </div>
  );
}
