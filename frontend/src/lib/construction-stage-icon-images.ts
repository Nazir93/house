/** PNG-иконки этапов: светлая и тёмная тема (файлы в public/images/stage-icons). */
export type ConstructionStageImageIconAssets = {
  light: string;
  dark: string;
};

export const CONSTRUCTION_STAGE_ICON_IMAGES = {
  foundation: {
    light: "/images/stage-icons/foundation-light.png",
    dark: "/images/stage-icons/foundation-dark.png",
  },
  walls: {
    light: "/images/stage-icons/walls-light.png",
    dark: "/images/stage-icons/walls-dark.png",
  },
  windows: {
    light: "/images/stage-icons/windows-light.png",
    dark: "/images/stage-icons/windows-dark.png",
  },
  roof: {
    light: "/images/stage-icons/roof-light.png",
    dark: "/images/stage-icons/roof-dark.png",
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

/** На акцентном фоне (зелёная кнопка) всегда белая версия иконки. */
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
