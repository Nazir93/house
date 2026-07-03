"use client";

import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import {
  hasConstructionStageImageIcon,
  resolveConstructionStageIconAssets,
} from "@/lib/construction-stage-icon-images";

/** PNG-иконка этапа: маска без фона, цвет задаёт тема (зелёный / белый). */
export function ConstructionStageIconImage({
  iconKey,
  className,
  onAccent = false,
  alt = "",
}: {
  iconKey: string;
  className?: string;
  /** Белая иконка на акцентном (зелёном) фоне кнопки. */
  onAccent?: boolean;
  alt?: string;
}) {
  const { resolvedTheme } = useTheme();

  if (!hasConstructionStageImageIcon(iconKey)) return null;

  const assets = resolveConstructionStageIconAssets(iconKey);
  if (!assets) return null;

  const maskSrc = assets.light;

  return (
    <span
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn(
        "inline-block shrink-0 bg-current",
        onAccent
          ? "text-[var(--accent-contrast)]"
          : resolvedTheme === "dark"
            ? "stage-icon-mask--dark"
            : "stage-icon-mask--light",
        className,
      )}
      style={{
        WebkitMaskImage: `url("${maskSrc}")`,
        maskImage: `url("${maskSrc}")`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskMode: "alpha",
        maskMode: "alpha",
      }}
    />
  );
}
