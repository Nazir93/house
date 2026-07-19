/** Иконки этапов: light = чёрный контур (светлый фон), dark = белый (тёмный/акцент). */
export type ConstructionStageImageIconAssets = {
  light: string;
  dark: string;
};

export const CONSTRUCTION_STAGE_ICON_IMAGES = {
  prep: {
    light: "/images/stage-icons/prep-light.svg",
    dark: "/images/stage-icons/prep-dark.svg",
  },
  foundation: {
    light: "/images/stage-icons/foundation-light.svg",
    dark: "/images/stage-icons/foundation-dark.svg",
  },
  walls: {
    light: "/images/stage-icons/walls-light.svg",
    dark: "/images/stage-icons/walls-dark.svg",
  },
  belt: {
    light: "/images/stage-icons/belt-light.svg",
    dark: "/images/stage-icons/belt-dark.svg",
  },
  floors: {
    light: "/images/stage-icons/floors-light.svg",
    dark: "/images/stage-icons/floors-dark.svg",
  },
  roof: {
    light: "/images/stage-icons/roof-light.svg",
    dark: "/images/stage-icons/roof-dark.svg",
  },
  windows: {
    light: "/images/stage-icons/windows-light.svg",
    dark: "/images/stage-icons/windows-dark.svg",
  },
  doors: {
    light: "/images/stage-icons/doors-light.svg",
    dark: "/images/stage-icons/doors-dark.svg",
  },
  interior: {
    light: "/images/stage-icons/interior-light.png",
    dark: "/images/stage-icons/interior-dark.png",
  },
  landscaping: {
    light: "/images/stage-icons/landscaping-light.png",
    dark: "/images/stage-icons/landscaping-dark.png",
  },
  engineering: {
    light: "/images/stage-icons/engineering-light.png",
    dark: "/images/stage-icons/engineering-dark.png",
  },
  facade: {
    light: "/images/stage-icons/facade-light.png",
    dark: "/images/stage-icons/facade-dark.png",
  },
} as const satisfies Record<string, ConstructionStageImageIconAssets>;

export type ConstructionStageImageIconKey = keyof typeof CONSTRUCTION_STAGE_ICON_IMAGES;

export function hasConstructionStageImageIcon(
  iconKey: string,
): iconKey is ConstructionStageImageIconKey {
  return iconKey in CONSTRUCTION_STAGE_ICON_IMAGES;
}

export function resolveConstructionStageIconAssets(
  iconKey: string,
): ConstructionStageImageIconAssets | null {
  if (!hasConstructionStageImageIcon(iconKey)) return null;
  return CONSTRUCTION_STAGE_ICON_IMAGES[iconKey];
}

/** На акцентном фоне (зелёная кнопка) всегда светлая (белая) версия иконки. */
export function resolveConstructionStageIconSrc(
  iconKey: string,
  theme: "light" | "dark",
  surface: "default" | "accent" = "default",
): string | null {
  const assets = resolveConstructionStageIconAssets(iconKey);
  if (!assets) return null;
  if (surface === "accent") return assets.dark;
  return theme === "dark" ? assets.dark : assets.light;
}
