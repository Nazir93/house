"use client";

import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import type { HouseProjectCatalogKind } from "@/lib/house-project-catalog";
import { useProjectCompareOptional } from "@/lib/project-compare-context";

type Props = {
  slug: string;
  catalogKind?: HouseProjectCatalogKind;
  className?: string;
  /** compact — круглая кнопка на карточке каталога */
  variant?: "card" | "detail";
};

export function ProjectCompareButton({
  slug,
  catalogKind = "author",
  className,
  variant = "card",
}: Props) {
  const compare = useProjectCompareOptional();
  if (!compare?.hydrated) return null;

  const entry = { catalogKind, slug };
  const selected = compare.isSelected(entry);
  const atMax = compare.count >= compare.max && !selected;

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    compare.toggle(entry);
  };

  const sizeClass =
    variant === "detail"
      ? "h-10 w-10"
      : "h-9 w-9";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={atMax}
      aria-pressed={selected}
      aria-label={
        selected
          ? "Убрать из сравнения"
          : atMax
            ? `Максимум ${compare.max} проекта в сравнении`
            : "Добавить в сравнение"
      }
      title={
        selected
          ? "Убрать из сравнения"
          : atMax
            ? `Максимум ${compare.max} проекта`
            : "Сравнить проект"
      }
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full backdrop-blur-sm transition",
        sizeClass,
        selected
          ? "bg-[#0f3d2e] text-white ring-2 ring-white/40"
          : "bg-white/95 text-[#0f3d2e] shadow-sm hover:bg-white disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
    >
      <LayoutGrid className={variant === "detail" ? "h-4 w-4" : "h-3.5 w-3.5"} aria-hidden />
    </button>
  );
}
