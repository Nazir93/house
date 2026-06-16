import { existsSync } from "fs";
import path from "path";

const PLACEHOLDER = "/images/banner-hero.png";

const PUBLIC_ROOT = path.join(process.cwd(), "public");

/** Целевые пути после загрузки фото из ТЗ (№1, №5, №8, №7). */
export const ABOUT_ASSET_PATHS = {
  founder: "/images/about/founder.jpg",
  founderLight: "/images/about/founder-light.jpg",
  founderDark: "/images/about/founder-dark.jpg",
  missionBg: "/images/about/mission-bg.jpg",
  valuesImage: "/images/about/values.jpg",
  team: "/images/about/team.jpg",
} as const;

function resolvePublicImage(targetPath: string, fallback = PLACEHOLDER): string {
  const relative = targetPath.replace(/^\//, "");
  const full = path.join(PUBLIC_ROOT, relative);
  return existsSync(full) ? targetPath : fallback;
}

export type AboutPageAssets = {
  founder: { src: string; lightSrc: string; darkSrc: string; alt: string };
  missionBg: { src: string; alt: string };
  valuesImage: { src: string; alt: string };
  team: { src: string | null; alt: string };
};

export function getAboutPageAssets(): AboutPageAssets {
  const teamSrc = resolvePublicImage(ABOUT_ASSET_PATHS.team, "");
  return {
    founder: {
      src: resolvePublicImage(ABOUT_ASSET_PATHS.founder),
      lightSrc: resolvePublicImage(ABOUT_ASSET_PATHS.founderLight, resolvePublicImage(ABOUT_ASSET_PATHS.founder)),
      darkSrc: resolvePublicImage(ABOUT_ASSET_PATHS.founderDark, resolvePublicImage(ABOUT_ASSET_PATHS.founder)),
      alt: "Кузнецова Ольга Олеговна — основатель компании «Часть Души»",
    },
    missionBg: {
      src: resolvePublicImage(ABOUT_ASSET_PATHS.missionBg),
      alt: "Загородный дом — миссия компании «Часть Души»",
    },
    valuesImage: {
      src: resolvePublicImage(ABOUT_ASSET_PATHS.valuesImage, "/images/portfolio/demo-house-02.svg"),
      alt: "Ценности компании «Часть Души»",
    },
    team: {
      src: teamSrc || null,
      alt: "Команда проекта «Часть Души»",
    },
  };
}
