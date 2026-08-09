import {
  PHONE,
  PHONE_RAW,
  PHONE2,
  PHONE2_RAW,
  EMAIL,
  ADDRESS,
  WORKING_HOURS,
  SOCIAL_LINKS,
  COMPANY,
} from "@/lib/constants";

export type CompanyRequisites = {
  fullName: string;
  shortName: string;
  inn: string;
  ogrn: string;
  ogrnip: string;
  website: string;
  postalAddress: string;
  bank: {
    name: string;
    account: string;
    corrAccount: string;
    bic: string;
  };
};

/** Контакты и соцсети для UI (дефолты из кода, при наличии — подмена из БД в loadContactConfig). */
export type ContactConfig = {
  phone: string;
  phoneRaw: string;
  phone2: string;
  phone2Raw: string;
  email: string;
  address: string;
  workingHours: string;
  company: CompanyRequisites;
  social: {
    telegram: string;
    vk: string;
    /** Канал Max — подвал. */
    max: string;
    /** Личный чат Max — кнопки «написать». */
    maxChat: string;
  };
};

export function createDefaultContactConfig(): ContactConfig {
  return {
    phone: PHONE,
    phoneRaw: PHONE_RAW,
    phone2: PHONE2,
    phone2Raw: PHONE2_RAW,
    email: EMAIL,
    address: ADDRESS,
    workingHours: WORKING_HOURS,
    company: {
      fullName: COMPANY.fullName,
      shortName: COMPANY.shortName,
      inn: COMPANY.inn,
      ogrn: COMPANY.ogrn,
      ogrnip: COMPANY.ogrnip,
      website: COMPANY.website,
      postalAddress: COMPANY.postalAddress,
      bank: { ...COMPANY.bank },
    },
    social: {
      telegram: SOCIAL_LINKS.telegram,
      vk: SOCIAL_LINKS.vk,
      max: SOCIAL_LINKS.maxChannel,
      maxChat: SOCIAL_LINKS.maxChat,
    },
  };
}

/** Часы работы офиса для schema.org — синхронно с WORKING_HOURS в constants. */
export const OFFICE_OPENING_HOURS_JSON_LD = [
  {
    "@type": "OpeningHoursSpecification" as const,
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const,
    opens: "09:00",
    closes: "20:00",
  },
  {
    "@type": "OpeningHoursSpecification" as const,
    dayOfWeek: ["Saturday"] as const,
    opens: "11:00",
    closes: "19:00",
  },
];
