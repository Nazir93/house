import { getPageMeta } from "@/lib/get-page-meta";
import { SITE_NAME, CITY } from "@/lib/constants";
import { IndividualDesignPageContent } from "@/components/construction/individual-design-page-content";

export async function generateMetadata() {
  return getPageMeta({
    title: `Индивидуальное проектирование — расчёт стоимости | ${SITE_NAME}`,
    description: `Стоимость вашего проекта дома в ${CITY}: основная и дополнительная документация от площади. Оставьте заявку на проектирование.`,
    path: "/individual-design",
    keywords: ["индивидуальный проект дома", "стоимость проектирования", CITY, SITE_NAME],
  });
}

export default function IndividualDesignPage() {
  return <IndividualDesignPageContent />;
}
