import { CITY, SITE_NAME } from "@/lib/constants";
import { getPageMeta } from "@/lib/get-page-meta";
import { CalculatorPageClient } from "./calculator-page-client";

export async function generateMetadata() {
  return getPageMeta({
    title: `Калькулятор стоимости строительства дома — ${SITE_NAME}`,
    description: `Ориентировочная смета по строительной площади, этажности, типу кровли и материалу стен. Работаем в ${CITY} и регионе.`,
    path: "/calculator",
    keywords: ["калькулятор строительства дома", "стоимость дома за м2", "смета дома", CITY],
  });
}

export default function CalculatorPage() {
  return <CalculatorPageClient />;
}
