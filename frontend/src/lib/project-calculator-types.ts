import type {
  PartOfSoulAddonPricingSpec,
  PartOfSoulPricingFloors,
  PartOfSoulRoofPitch,
} from "@/lib/part-of-soul-pricing";

/** Идентификаторы этапов — совпадают с калькулятором в UI. */
export type CalculatorStageId =
  | "prep"
  | "foundation"
  | "walls"
  | "belt"
  | "floors"
  | "roof"
  | "windows"
  | "doors";

export interface CalculatorStageTable {
  /** Иллюстрация этапа; если нет — подставляется обложка проекта. */
  imageUrl?: string | null;
  rows: { label: string; value: string }[];
}

/** Режим строки калькулятора по PDF («Часть души»). Обычные проекты — только price. */
export type CalculatorAddonPartOfSoulKind = PartOfSoulAddonPricingSpec;

export interface CalculatorAddonItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  /** Если задано и включён режим калькулятора PDF — сумма считается по матрице и площади. */
  partOfSoulAddon?: CalculatorAddonPartOfSoulKind;
}

/** Настройка формульного калькулятора на карточке проекта. */
export interface PartOfSoulCalculatorConfig {
  enabled: boolean;
  /** Этажность для расчёта (1 / 1,5 / 2). По умолчанию из поля «этаж» проекта. */
  pricingFloors?: PartOfSoulPricingFloors;
  /** Тип кровли проекта для расчёта (двухскатная / трёхскатная / четырёхскатная); на сайте не переключается. */
  defaultRoof?: PartOfSoulRoofPitch;
  smallHouseThresholdSqm: number;
  /** Надбавка к коробке при площади &lt; порога (PDF: 15 %). */
  shellSurchargeUnderThreshold: number;
  /** Надбавка к сумме выбранных доп. опций (инж. + фасад) при площади &lt; порога (PDF: 10 %). */
  addonsSurchargeUnderThreshold: number;
}

export interface CalculatorAddonGroup {
  title: string;
  items: CalculatorAddonItem[];
}

export interface CalculatorTransportBand {
  id: string;
  label: string;
  /** Фиксированная надбавка, ₽ (если не задан percent). */
  surcharge?: number;
  /** Доля от базы (коробка + опции), %. */
  percent?: number;
}

export interface CalculatorConsultationCfg {
  name?: string;
  role?: string;
  phone?: string;
  phoneDisplay?: string;
  photoUrl?: string;
  online?: boolean;
}

/** Расширенный UI калькулятора комплектации (источник: PDF / calculatorJson в админке). */
export interface ProjectCalculatorUi {
  consultation?: CalculatorConsultationCfg;
  /** Формульный расчёт по PDF (часть души). */
  partOfSoul?: PartOfSoulCalculatorConfig;
  transportBands?: CalculatorTransportBand[];
  /** Таблицы по этапам для всех материалов сразу. */
  stages?: Partial<Record<CalculatorStageId, CalculatorStageTable>>;
  /** Переопределение по id уровня цены: gas | ceramic | brick и т.д. */
  stagesByTier?: Record<string, Partial<Record<CalculatorStageId, CalculatorStageTable>>>;
  addons?: CalculatorAddonGroup[];
}
