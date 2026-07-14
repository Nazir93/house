/** Опции для быстрой кнопки «+ Инженерные сети и опции» на карточке проекта. */
export const ENGINEERING_NETWORKS_PRESET_SLUGS = [
  "electric",
  "water",
  "radiators",
  "sewer",
  "bio",
  "boiler",
] as const;

/** Стройопции для кнопки «Предчистовая отделка» (поверх инженерных сетей). */
export const PREFINISH_CONSTRUCTION_PRESET_SLUGS = [
  "interior_plaster",
  "roof_insulation_200",
  "soffits",
  "gutter",
] as const;

/**
 * Пресет инженерных сетей: электроснабжение, разводка воды, радиаторы,
 * канализация, станция биоочистки, котельная.
 * Тёплый пол и прочие опции в набор не входят.
 */
export function applyEngineeringNetworksPreset(): Set<string> {
  return new Set(ENGINEERING_NETWORKS_PRESET_SLUGS);
}

/**
 * Пресет «Предчистовая отделка»: инженерные сети + внутренняя штукатурка,
 * утепление кровли 200 мм, софиты, водосточная система.
 */
export function applyPrefinishFinishPreset(): {
  engineering: Set<string>;
  construction: Set<string>;
} {
  return {
    engineering: applyEngineeringNetworksPreset(),
    construction: new Set(PREFINISH_CONSTRUCTION_PRESET_SLUGS),
  };
}
