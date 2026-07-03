"use client";

import { useLayoutEffect, useState } from "react";

import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import {
  hasConstructionStageImageIcon,
  resolveConstructionStageIconSrc,
} from "@/lib/construction-stage-icon-images";
import type { ResolvedSiteTheme } from "@/lib/theme-preference";

function readDomTheme(): ResolvedSiteTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

/** PNG-иконка этапа: один прозрачный файл под текущую тему. */
export function ConstructionStageIconImage({
  iconKey,
  className,
  onAccent = false,
  alt = "",
}: {
  iconKey: string;
  className?: string;
  /** Белая версия на тёмном/акцентном фоне (активная кнопка этапа). */
  onAccent?: boolean;
  alt?: string;
}) {
  const { theme } = useTheme();
  const [domTheme, setDomTheme] = useState<ResolvedSiteTheme>(theme);

  useLayoutEffect(() => {
    setDomTheme(readDomTheme());
  }, [theme]);

  if (!hasConstructionStageImageIcon(iconKey)) return null;

  const resolvedTheme = onAccent ? "dark" : domTheme;
  const src = resolveConstructionStageIconSrc(iconKey, resolvedTheme, onAccent ? "accent" : "default");
  if (!src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("shrink-0 object-contain", className)}
      aria-hidden={alt ? undefined : true}
    />
  );
}
