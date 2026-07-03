import { cn } from "@/lib/utils";
import {
  hasConstructionStageImageIcon,
  resolveConstructionStageIconAssets,
} from "@/lib/construction-stage-icon-images";

/** PNG-иконка этапа с переключением light/dark через data-theme. */
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
  if (!hasConstructionStageImageIcon(iconKey)) return null;

  const assets = resolveConstructionStageIconAssets(iconKey)!;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        onAccent && "stage-icon-on-accent",
        className,
      )}
      aria-hidden={alt ? undefined : true}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assets.light}
        alt={alt}
        className="stage-icon-img stage-icon-img--theme-light h-full w-full object-contain"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={assets.dark}
        alt={alt}
        className="stage-icon-img stage-icon-img--theme-dark absolute inset-0 h-full w-full object-contain"
      />
    </span>
  );
}
