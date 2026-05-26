"use client";

import { SiteSelect, type SiteSelectOption } from "@/components/ui/site-select";
import { cn } from "@/lib/utils";

export type PortfolioFilterSelectItem = SiteSelectOption;

export function PortfolioFilterSelect({
  label,
  value,
  onValueChange,
  options,
  active = false,
  className,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: PortfolioFilterSelectItem[];
  active?: boolean;
  className?: string;
}) {
  return (
    <SiteSelect
      value={value}
      onValueChange={onValueChange}
      options={options}
      variant="pill"
      size="sm"
      active={active}
      className={cn("shrink-0", className)}
      getTriggerLabel={(selected) =>
        selected && selected.value !== "all" ? selected.label : label
      }
      aria-label={label}
    />
  );
}
