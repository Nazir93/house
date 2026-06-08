import type { PartOfSoulPricingFloors } from "@/lib/part-of-soul-pricing";
import type { CalculatorStageId } from "@/lib/project-calculator-types";

/** Заглушка из пресета калькулятора — не считается кастомной картинкой этапа. */
export const LEGACY_STAGE_PLACEHOLDER_IMAGE = "/images/banner/banner-hero-01.png";

/**
 * Схема фундамента: монолитная плита 300 мм (1,5- и 2-этажные дома).
 * Файл: public/images/calculator/foundation-multi-story-300mm.png
 */
export const FOUNDATION_STAGE_IMAGE_MULTI_STORY =
  "/images/calculator/foundation-multi-story-300mm.png";

/**
 * Схема фундамента: монолитная плита 250 мм (одноэтажные) — зарезервировано под следующий файл.
 * Файл: public/images/calculator/foundation-single-story-250mm.png
 */
export const FOUNDATION_STAGE_IMAGE_SINGLE_STORY =
  "/images/calculator/foundation-single-story-250mm.png";

/**
 * Схема кровли: мансардный 1,5 этаж, газобетон.
 * Файл: public/images/calculator/roof-mansard-gas-1.5.png
 */
export const ROOF_STAGE_IMAGE_MANSARD_GAS_1_5 =
  "/images/calculator/roof-mansard-gas-1.5.png";

/**
 * Схема кровли: мансардный 1,5 этаж, керамоблок.
 * Файл: public/images/calculator/roof-mansard-ceramic-1.5.png
 */
export const ROOF_STAGE_IMAGE_MANSARD_CERAMIC_1_5 =
  "/images/calculator/roof-mansard-ceramic-1.5.png";

/**
 * Схема кровли: мансардный 1,5 этаж, керамический кирпич.
 * Файл: public/images/calculator/roof-mansard-brick-1.5.png
 */
export const ROOF_STAGE_IMAGE_MANSARD_BRICK_1_5 =
  "/images/calculator/roof-mansard-brick-1.5.png";

/**
 * Схема перекрытий: 1 этаж, газобетон.
 * Файл: public/images/calculator/floors-single-story-gas-1.png
 */
export const FLOORS_STAGE_IMAGE_SINGLE_STORY_GAS =
  "/images/calculator/floors-single-story-gas-1.png";

/**
 * Схема перекрытий: 1 этаж, керамический блок.
 * Файл: public/images/calculator/floors-single-story-ceramic-1.png
 */
export const FLOORS_STAGE_IMAGE_SINGLE_STORY_CERAMIC =
  "/images/calculator/floors-single-story-ceramic-1.png";

/**
 * Схема перекрытий: 1 этаж, керамический кирпич.
 * Файл: public/images/calculator/floors-single-story-brick-1.png
 */
export const FLOORS_STAGE_IMAGE_SINGLE_STORY_BRICK =
  "/images/calculator/floors-single-story-brick-1.png";

/**
 * Схема перекрытий: 1,5 и 2 этажа, газобетон.
 * Файл: public/images/calculator/floors-multi-story-gas.png
 */
export const FLOORS_STAGE_IMAGE_MULTI_STORY_GAS =
  "/images/calculator/floors-multi-story-gas.png";

/**
 * Схема перекрытий: 1,5 и 2 этажа, керамический блок.
 * Файл: public/images/calculator/floors-multi-story-ceramic.png
 */
export const FLOORS_STAGE_IMAGE_MULTI_STORY_CERAMIC =
  "/images/calculator/floors-multi-story-ceramic.png";

/**
 * Схема перекрытий: 1,5 и 2 этажа, керамический кирпич.
 * Файл: public/images/calculator/floors-multi-story-brick.png
 */
export const FLOORS_STAGE_IMAGE_MULTI_STORY_BRICK =
  "/images/calculator/floors-multi-story-brick.png";

/**
 * Схема стен: газобетон (все этажности).
 * Файл: public/images/calculator/walls-gas.png
 */
export const WALLS_STAGE_IMAGE_GAS = "/images/calculator/walls-gas.png";

/**
 * Схема стен: керамический блок (все этажности).
 * Файл: public/images/calculator/walls-ceramic.png
 */
export const WALLS_STAGE_IMAGE_CERAMIC = "/images/calculator/walls-ceramic.png";

/**
 * Схема стен: керамический кирпич (все этажности).
 * Файл: public/images/calculator/walls-brick.png
 */
export const WALLS_STAGE_IMAGE_BRICK = "/images/calculator/walls-brick.png";

/**
 * Схема окон: все проекты (материал и этажность не важны).
 * Файл: public/images/calculator/windows-all.png
 */
export const WINDOWS_STAGE_IMAGE_ALL = "/images/calculator/windows-all.png";

/**
 * Схема дверей: все проекты (материал и этажность не важны).
 * Файл: public/images/calculator/doors-all.png
 */
export const DOORS_STAGE_IMAGE_ALL = "/images/calculator/doors-all.png";

/** Картинка этапа «Фундамент» по этажности проекта (сайтовая привязка). */
export function resolveFoundationStageImageUrl(
  floors: PartOfSoulPricingFloors,
): string | null {
  if (floors === 1.5 || floors === 2) return FOUNDATION_STAGE_IMAGE_MULTI_STORY;
  if (floors === 1) return FOUNDATION_STAGE_IMAGE_SINGLE_STORY;
  return null;
}

/** Картинка этапа «Кровля» по этажности и материалу коробки. */
export function resolveRoofStageImageUrl(params: {
  floors: PartOfSoulPricingFloors;
  tierKey: string;
}): string | null {
  if (params.floors !== 1.5 && params.floors !== 2) return null;
  if (params.tierKey === "gas") return ROOF_STAGE_IMAGE_MANSARD_GAS_1_5;
  if (params.tierKey === "ceramic") return ROOF_STAGE_IMAGE_MANSARD_CERAMIC_1_5;
  if (params.tierKey === "brick") return ROOF_STAGE_IMAGE_MANSARD_BRICK_1_5;
  return null;
}

/** Картинка этапа «Перекрытия» по этажности и материалу коробки. */
export function resolveFloorsStageImageUrl(params: {
  floors: PartOfSoulPricingFloors;
  tierKey: string;
}): string | null {
  if (params.tierKey === "gas") {
    if (params.floors === 1) return FLOORS_STAGE_IMAGE_SINGLE_STORY_GAS;
    if (params.floors === 1.5 || params.floors === 2) return FLOORS_STAGE_IMAGE_MULTI_STORY_GAS;
  }
  if (params.tierKey === "ceramic") {
    if (params.floors === 1) return FLOORS_STAGE_IMAGE_SINGLE_STORY_CERAMIC;
    if (params.floors === 1.5 || params.floors === 2) return FLOORS_STAGE_IMAGE_MULTI_STORY_CERAMIC;
  }
  if (params.tierKey === "brick") {
    if (params.floors === 1) return FLOORS_STAGE_IMAGE_SINGLE_STORY_BRICK;
    if (params.floors === 1.5 || params.floors === 2) return FLOORS_STAGE_IMAGE_MULTI_STORY_BRICK;
  }
  return null;
}

/** Картинка этапа «Стены» по материалу коробки. */
export function resolveWallsStageImageUrl(tierKey: string): string | null {
  if (tierKey === "gas") return WALLS_STAGE_IMAGE_GAS;
  if (tierKey === "ceramic") return WALLS_STAGE_IMAGE_CERAMIC;
  if (tierKey === "brick") return WALLS_STAGE_IMAGE_BRICK;
  return null;
}

/** Картинка этапа «Окна» — единая для всех проектов. */
export function resolveWindowsStageImageUrl(): string {
  return WINDOWS_STAGE_IMAGE_ALL;
}

/** Картинка этапа «Двери» — единая для всех проектов. */
export function resolveDoorsStageImageUrl(): string {
  return DOORS_STAGE_IMAGE_ALL;
}

export function isLegacyStagePlaceholderImage(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  return url.trim() === LEGACY_STAGE_PLACEHOLDER_IMAGE;
}

/** Схема этапа из public/images/calculator — показываем целиком, без обрезки cover. */
export function isCalculatorStageDiagramUrl(url: string | null | undefined): boolean {
  return !!url?.includes("/images/calculator/");
}

/** Итоговый URL картинки этапа в блоке «Состав работ по этапам». */
export function resolveStageDisplayImageUrl(params: {
  stageId: CalculatorStageId;
  floors: PartOfSoulPricingFloors;
  tierKey?: string;
  tableImageUrl?: string | null;
  coverImageUrl?: string | null;
  fallbackImageUrl?: string;
}): string {
  const fallback = params.fallbackImageUrl ?? LEGACY_STAGE_PLACEHOLDER_IMAGE;

  if (params.stageId === "foundation") {
    const bound = resolveFoundationStageImageUrl(params.floors);
    if (bound && isLegacyStagePlaceholderImage(params.tableImageUrl)) return bound;
  }

  if (params.stageId === "roof" && params.tierKey) {
    const bound = resolveRoofStageImageUrl({ floors: params.floors, tierKey: params.tierKey });
    if (bound && isLegacyStagePlaceholderImage(params.tableImageUrl)) return bound;
  }

  if (params.stageId === "floors" && params.tierKey) {
    const bound = resolveFloorsStageImageUrl({ floors: params.floors, tierKey: params.tierKey });
    if (bound && isLegacyStagePlaceholderImage(params.tableImageUrl)) return bound;
  }

  if (params.stageId === "walls" && params.tierKey) {
    const bound = resolveWallsStageImageUrl(params.tierKey);
    if (bound && isLegacyStagePlaceholderImage(params.tableImageUrl)) return bound;
  }

  if (params.stageId === "windows") {
    const bound = resolveWindowsStageImageUrl();
    if (isLegacyStagePlaceholderImage(params.tableImageUrl)) return bound;
  }

  if (params.stageId === "doors") {
    const bound = resolveDoorsStageImageUrl();
    if (isLegacyStagePlaceholderImage(params.tableImageUrl)) return bound;
  }

  return params.tableImageUrl || params.coverImageUrl || fallback;
}
