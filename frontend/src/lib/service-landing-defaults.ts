import type { ServiceType } from "@prisma/client";
import { CITY, SITE_NAME } from "@/lib/constants";
import { getServiceLandingHeroBannerFields } from "@/lib/service-card-media";
import { parseServiceLandingDocument, type ServiceLandingDocument } from "@/lib/service-landing-schema";

/** Устаревшие slug услуг из прежней версии сайта — редирект в proxy (Edge). */
export const SERVICE_PAGE_SLUGS = [] as const;
export type ServicePageSlug = (typeof SERVICE_PAGE_SLUGS)[number];

export const SERVICE_PAGE_SLUG_TO_TYPE = {} as Record<ServicePageSlug, ServiceType>;

export function isServicePageSlug(s: string): s is ServicePageSlug {
  return (SERVICE_PAGE_SLUGS as readonly string[]).includes(s);
}

const LEGACY_SLUG: Record<ServiceType, string> = {
  ELECTRICAL: "electrical",
  ACOUSTICS: "acoustics",
  STRUCTURED_CABLING: "structured-cabling",
  SMART_HOME: "smart-home",
  SECURITY: "security",
  ARCHITECTURAL_LIGHTING: "architectural-lighting",
};

function fallbackLandingDoc(serviceType: ServiceType): ServiceLandingDocument {
  const C = CITY;
  const S = SITE_NAME;
  const key = LEGACY_SLUG[serviceType];
  const path = `/services/${key}`;
  return {
    sections: [
      {
        type: "schema",
        serviceName: `${S} — загородное строительство`,
        serviceDescription: `Типовые и индивидуальные дома, проектирование и строительство под ключ в ${C}. Актуальные услуги — в разделе «Услуги» и каталоге проектов.`,
        slug: path,
        priceRange: "",
      },
      {
        type: "hero",
        title: `Проектирование и строительство домов в ${C}`,
        subtitle: `${S}: каталог типовых проектов, фундамент, коробка, кровля, инженерные сети и отделка. Оставьте заявку — рассчитаем ориентир по смете и срокам.`,
        serviceKey: key,
        ...(getServiceLandingHeroBannerFields(path) ?? {}),
        tag: "Строительство домов",
        features: [
          "Типовые проекты и индивидуальное проектирование",
          "Фундамент, стены, кровля",
          "Инженерия и отделка под ключ",
        ],
        goals: `Надёжный дом с понятной документацией и прозрачными этапами работ.`,
      },
      {
        type: "textBlock",
        leftText: `Раздел относится к архивной записи услуги в системе. Основной фокус сайта — загородные дома: смотрите каталог на странице «Проекты», примеры объектов в «Портфолио» и актуальные виды работ в разделе «Услуги».`,
        rightText: `Чтобы обсудить ваш участок, комплектацию и бюджет, напишите или позвоните — подключим проектировщика или прораба по задаче.`,
      },
      {
        type: "faq",
        serviceKey: key,
        items: [
          {
            question: "Где посмотреть проекты домов?",
            answer: `Каталог типовых решений — на странице /projects. Для индивидуального проекта — раздел /individual-design.`,
          },
          {
            question: "Какие услуги актуальны?",
            answer: `Проектирование, фундамент, кровля, инженерные сети и отделка — отдельные страницы в разделе /services.`,
          },
        ],
      },
    ],
  };
}

/** Убираем витрины без фото (только подпись). */
export function stripShowcaseSections(doc: ServiceLandingDocument): ServiceLandingDocument {
  return {
    sections: doc.sections.filter((s) => {
      if (s.type !== "showcase") return true;
      return Boolean(s.imageUrl?.trim());
    }),
  };
}

export function getDefaultServiceLandingDocument(serviceType: ServiceType): ServiceLandingDocument {
  return stripShowcaseSections(fallbackLandingDoc(serviceType));
}

export function resolveServiceLandingDocument(
  landingJson: unknown | null | undefined,
  serviceType: ServiceType
): ServiceLandingDocument {
  const parsed = parseServiceLandingDocument(landingJson);
  if (parsed && parsed.sections.length > 0) return parsed;
  return getDefaultServiceLandingDocument(serviceType);
}
