import type { LucideIcon } from "lucide-react";

import { ConstructionStageIconImage } from "@/components/construction/construction-stage-icon-image";
import { hasConstructionStageImageIcon } from "@/lib/construction-stage-icon-images";
import { cn } from "@/lib/utils";

/** Иконка этапа в кнопке калькулятора: PNG при наличии, иначе Lucide. */
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
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5 sm:h-6 sm:w-6";

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
      className={cn(sizeClass, "shrink-0", active ? "opacity-95" : "opacity-80", className)}
      strokeWidth={1.75}
      aria-hidden
    />
  );
}
