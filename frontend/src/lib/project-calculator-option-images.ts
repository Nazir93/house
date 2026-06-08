/** Заглушки из пресета — заменяются схемами из /images/calculator/options/. */
const LEGACY_BANNER_PREFIX = "/images/banner/banner-hero-";

export type CalculatorOptionGroupSlug = "engineering" | "construction";

export type CalculatorOptionCatalogMeta = {
  description: string;
  imageUrl: string;
};

const OPTIONS_BASE = "/images/calculator/options";

/** Схемы опций калькулятора: slug → описание и картинка. */
export const CALCULATOR_OPTION_CATALOG_META: Record<string, CalculatorOptionCatalogMeta> = {
  electric: {
    imageUrl: `${OPTIONS_BASE}/electric.png`,
    description:
      "Вводной щит, автоматические выключатели, разводка по группам, заземление и УЗО. Объём работ считается за м² строительной площади дома с учётом этажности.",
  },
  radiators: {
    imageUrl: `${OPTIONS_BASE}/radiators.png`,
    description:
      "Поставка и монтаж радиаторов отопления, термостатические головки, обвязка и подключение к магистралям. Ставка за м² строительной площади.",
  },
  water: {
    imageUrl: `${OPTIONS_BASE}/water.png`,
    description:
      "Коллекторная разводка холодной и горячей воды по точкам потребления: кухня, санузлы, котельная. Схема уточняется при замере объекта.",
  },
  heatedFloor: {
    imageUrl: `${OPTIONS_BASE}/heated-floor.png`,
    description:
      "Водяной тёплый пол: трубный контур в стяжке, коллектор, циркуляционный насос и терморегуляция. Расчёт за м² отапливаемой площади первого этажа.",
  },
  sewer: {
    imageUrl: `${OPTIONS_BASE}/sewer.png`,
    description:
      "Внутренняя канализация: стояки, отводы к сантехнике, ревизии и уклоны. Подключение к локальной станции биоочистки или центральной сети.",
  },
  boiler: {
    imageUrl: `${OPTIONS_BASE}/boiler.png`,
    description:
      "Узел котельной: котёл, расширительный бак, циркуляционный насос, коллекторы и обвязка. Фиксированная позиция в смете, модель — на консультации.",
  },
  bio: {
    imageUrl: `${OPTIONS_BASE}/bio.png`,
    description:
      "Локальная станция биологической очистки: приём стоков, аэрация, отстой и сброс очищенной воды. Подбор ёмкости и модели — по числу проживающих.",
  },
  interior_plaster: {
    imageUrl: `${OPTIONS_BASE}/interior-plaster.png`,
    description:
      "Внутренняя штукатурка стен: оштукатуривание углов по маякам, штукатурные уголки, выравнивание и финишное нанесение слоёв.",
  },
  blind_area: {
    imageUrl: `${OPTIONS_BASE}/blind-area.png`,
    description:
      "Отмостка по периметру фундамента: уклон от стены, подготовка основания, укладка плитки или бетона, линейный водоотвод в дренаж.",
  },
  drainage: {
    imageUrl: `${OPTIONS_BASE}/drainage.png`,
    description:
      "Дренаж вокруг дома: перфорированная труба в щебне, геотекстиль, колодец-накопитель и отвод воды от фундамента по периметру.",
  },
  soffits: {
    imageUrl: `${OPTIONS_BASE}/soffits.png`,
    description:
      "Софиты и подшивка карнизов: вентилируемые панели, обрамление свесов кровли, защита подкровельного пространства от влаги.",
  },
  gutter: {
    imageUrl: `${OPTIONS_BASE}/gutter.png`,
    description:
      "Водосточная система: желоба, воронки, отводы к ливневому колодцу или дренажу. Длина рассчитывается через коэффициент водостока категории дома.",
  },
  roof_folding: {
    imageUrl: `${OPTIONS_BASE}/roof-folding.png`,
    description:
      "Фальцевая кровля: стоячие фальцы, крепёжные клипсы, подкровельная гидроизоляция и утепление. Стоимость — по площади кровли.",
  },
  roof_soft: {
    imageUrl: `${OPTIONS_BASE}/roof-soft.png`,
    description:
      "Мягкая кровля: гибкая черепица, подкладочный ковёр, обрешётка, вентиляция конька и ендовы. Расчёт по площади кровельного ската.",
  },
  roof_insulation_200: {
    imageUrl: `${OPTIONS_BASE}/roof-insulation-200.png`,
    description:
      "Утепление кровли 200 мм: минеральная вата между стропилами, пароизоляция, контробрешётка и вентзазор под кровельным покрытием.",
  },
  roof_insulation_250: {
    imageUrl: `${OPTIONS_BASE}/roof-insulation-250.png`,
    description:
      "Утепление кровли 250 мм: усиленный тёплый контур для мансарды и жилых чердачных помещений, паро- и гидрозащита кровельного пирога.",
  },
  monolithic_stairs: {
    imageUrl: `${OPTIONS_BASE}/monolithic-stairs.png`,
    description:
      "Монолитная лестница: опалубка, арматурный каркас, бетонирование и демонтаж щитов. Доступна для мансардных и двухэтажных домов.",
  },
  monolithic_overlap: {
    imageUrl: `${OPTIONS_BASE}/monolithic-overlap.png`,
    description:
      "Монолитное перекрытие: стойки, балки, арматурная сетка и заливка плиты. Для мансардных и двухэтажных проектов по несущей схеме.",
  },
};

export function isLegacyOptionPlaceholderImage(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  const trimmed = url.trim();
  return trimmed.startsWith(LEGACY_BANNER_PREFIX) || trimmed === "/images/banner/banner-hero-01.png";
}

/** Схема опции из public/images/calculator — показываем целиком, без обрезки. */
export function isCalculatorOptionDiagramUrl(url: string | null | undefined): boolean {
  return !!url?.includes("/images/calculator/");
}

export function getOptionCatalogMeta(
  slug: string,
  groupSlug?: CalculatorOptionGroupSlug | null,
): CalculatorOptionCatalogMeta | null {
  void groupSlug;
  return CALCULATOR_OPTION_CATALOG_META[slug] ?? null;
}

export function resolveOptionDisplayDescription(params: {
  slug: string;
  groupSlug?: CalculatorOptionGroupSlug | null;
  description?: string | null;
}): string | null {
  const custom = params.description?.trim();
  if (custom) return custom;
  return getOptionCatalogMeta(params.slug, params.groupSlug)?.description ?? null;
}

export function resolveOptionDisplayImageUrl(params: {
  slug: string;
  groupSlug?: CalculatorOptionGroupSlug | null;
  imageUrl?: string | null;
}): string | null {
  const custom = params.imageUrl?.trim();
  if (custom && !isLegacyOptionPlaceholderImage(custom)) return custom;
  return getOptionCatalogMeta(params.slug, params.groupSlug)?.imageUrl ?? null;
}
