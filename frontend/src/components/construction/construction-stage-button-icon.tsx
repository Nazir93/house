import type { LucideIcon } from "lucide-react";

import { ConstructionStageIconImage } from "@/components/construction/construction-stage-icon-image";
import { hasConstructionStageImageIcon } from "@/lib/construction-stage-icon-images";
import { cn } from "@/lib/utils";

/** Иконка этапа в кнопке калькулятора: SVG/PNG при наличии, иначе Lucide. */
export function ConstructionStageButtonIcon({
  iconKey,
  Lucide,
  active = false,
  className,
  size = "md",
}: {
  iconKey?: string | null;
  Lucide: LucideIcon;
  active?: boolean;
  className?: string;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-7 w-7 sm:h-8 sm:w-8";

  if (iconKey && hasConstructionStageImageIcon(iconKey)) {
    return (
      <ConstructionStageIconImage
        iconKey={iconKey}
        className={cn(sizeClass, "shrink-0", className)}
        onAccent={active}
      />
    );
  }

  const Icon = Lucide;
  return (
    <Icon
      className={cn(
        sizeClass,
        "shrink-0 text-current",
        active ? "opacity-100" : "opacity-90",
        className,
      )}
      strokeWidth={2}
      aria-hidden
    />
  );
}
