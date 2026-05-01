import { CITY, SERVICE_REGIONS, SITE_NAME } from "@/lib/constants";
import type { ConstructionServiceSlug } from "@/lib/construction-service-data";

const GEO = `Офис в ${CITY}, проекты в ${SERVICE_REGIONS}.`;

export function getConstructionServiceSeo(slug: ConstructionServiceSlug): {
  title: string;
  description: string;
  keywords: string[];
} {
  const S = SITE_NAME;
  switch (slug) {
    case "projecting":
      return {
        title: `Проектирование домов под ключ — ${CITY} | ${S}`,
        description: `Архитектурный и рабочий проект загородного дома: планировки, фасады, узлы, документация для стройки. ${GEO}`,
        keywords: [`проектирование домов ${CITY}`, "проект дома газобетон", "рабочая документация дом", S],
      };
    case "foundation":
      return {
        title: `Фундамент под ключ — ${CITY} | ${S}`,
        description: `Ленточный, плита, сваи: земляные работы, армирование, бетон, гидроизоляция и приёмка. ${GEO}`,
        keywords: [`фундамент под ключ ${CITY}`, "устройство фундамента", "монолитный фундамент", S],
      };
    case "roofing":
      return {
        title: `Монтаж кровли — ${CITY} | ${S}`,
        description: `Стропила, кровельный пирог, металлочерепица, мягкая и фальцевая кровля, узлы и водосток. ${GEO}`,
        keywords: [`монтаж кровли ${CITY}`, "кровля частный дом", "металлочерепица монтаж", S],
      };
    case "engineering":
      return {
        title: `Инженерные сети в доме — ${CITY} | ${S}`,
        description: `Электрика, водоснабжение, канализация, отопление и котельная: монтаж и пусконаладка. ${GEO}`,
        keywords: [`инженерные сети дом ${CITY}`, "водопровод канализация дом", "отопление монтаж коттедж", S],
      };
    case "finishing":
      return {
        title: `Отделка дома под ключ — ${CITY} | ${S}`,
        description: `Черновая и чистовая отделка, фасады и финальная приёмка загородного дома. ${GEO}`,
        keywords: [`отделка дома под ключ ${CITY}`, "чистовая отделка коттедж", "фасад дома", S],
      };
    default:
      return {
        title: `Услуги — ${S}`,
        description: `${S}: строительство загородных домов. ${GEO}`,
        keywords: [S, CITY],
      };
  }
}
