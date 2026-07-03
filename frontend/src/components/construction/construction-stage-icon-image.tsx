"use client";

import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import {
  hasConstructionStageImageIcon,
  resolveConstructionStageIconSrc,
} from "@/lib/construction-stage-icon-images";

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

  if (!hasConstructionStageImageIcon(iconKey)) return null;

  const src = resolveConstructionStageIconSrc(
    iconKey,
    theme,
    onAccent ? "accent" : "default",
  );
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
