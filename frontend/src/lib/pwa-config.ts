import type { MetadataRoute } from "next";

export const PWA_THEME_COLORS = {
  light: "#F6F6F4",
  dark: "#121816",
  brand: "#0F3D2E",
} as const;

export const PWA_ICON_PATHS = {
  svg: "/icons/icon.svg",
  png32: "/icon.png",
  png192: "/icons/icon-192.png",
  png512: "/icons/icon-512.png",
  appleTouch: "/icons/apple-touch-icon.png",
  favicon: "/favicon.ico",
} as const;

/** OG / JSON-LD / push-уведомления, если нет NEXT_PUBLIC_DEFAULT_OG_IMAGE */
export const SITE_DEFAULT_ICON_PATH = PWA_ICON_PATHS.png512;

export const PWA_SW_URL = "/serwist/sw.js" as const;

export type PwaManifestInput = {
  siteName: string;
  description: string;
};

export function resolvePwaShortName(siteName: string): string {
  const trimmed = siteName.trim();
  if (!trimmed) return "Часть души";
  return trimmed.length <= 12 ? trimmed : trimmed.slice(0, 12).trimEnd();
}

export function buildPwaManifest(input: PwaManifestInput): MetadataRoute.Manifest {
  const name = input.siteName.trim() || "Часть души";
  const shortName = resolvePwaShortName(name);

  return {
    name: `${name} — загородные дома под ключ`,
    short_name: shortName,
    description: input.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: PWA_THEME_COLORS.light,
    theme_color: PWA_THEME_COLORS.brand,
    icons: [
      {
        src: PWA_ICON_PATHS.png192,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: PWA_ICON_PATHS.png512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: PWA_ICON_PATHS.svg,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}

export function buildPwaPrecacheUrls(): string[] {
  return [
    PWA_ICON_PATHS.png32,
    PWA_ICON_PATHS.svg,
    PWA_ICON_PATHS.png192,
    PWA_ICON_PATHS.png512,
    PWA_ICON_PATHS.appleTouch,
    "/manifest.webmanifest",
  ];
}

export function resolvePwaCacheRevision(): string {
  const fromEnv =
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    process.env.GIT_COMMIT_SHA?.trim() ||
    process.env.npm_package_version?.trim();
  return fromEnv || "1";
}

export function isPwaEnabled(nodeEnv: string | undefined = process.env.NODE_ENV): boolean {
  return nodeEnv === "production";
}

/** Serwist: precache только иконки PWA, без тяжёлого public (видео, PDF, галереи). */
export const PWA_SERWIST_GLOB_PATTERNS = ["icons/**/*.{png,svg}"] as const;

export const PWA_SERWIST_GLOB_IGNORES = [
  "**/node_modules/**",
  "**/videos/**",
  "**/*.mp4",
  "**/*.pdf",
  "**/images/**",
  "**/proektirovanie/**",
  "**/*.webm",
] as const;

export const PWA_SERWIST_MAX_FILE_BYTES = 2 * 1024 * 1024;
