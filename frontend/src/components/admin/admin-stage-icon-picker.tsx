"use client";

import type { ComponentProps } from "react";
import { StageIcon } from "@/components/account/stage-icon";
import { CLIENT_STAGE_ICON_PICKER_KEYS } from "@/lib/client-stage-icon-assets";
import { cn } from "@/lib/utils";

type AdminStageIconPickerProps = {
  value: string;
  onChange: (iconKey: string) => void;
  className?: string;
};

/** Выбор одной из 8 иконок этапа. */
export function AdminStageIconPicker({ value, onChange, className }: AdminStageIconPickerProps) {
  return (
    <div
      className={cn("flex flex-wrap gap-1 max-w-[11rem]", className)}
      role="listbox"
      aria-label="Иконка этапа"
    >
      {CLIENT_STAGE_ICON_PICKER_KEYS.map((key) => {
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            role="option"
            aria-selected={selected}
            title={key}
            onClick={() => onChange(key)}
            className={cn(
              "p-1 rounded-lg border transition-colors",
              selected
                ? "border-[#0F3D2E] bg-[#0F3D2E]/20"
                : "border-white/[0.08] bg-white/[0.03] hover:border-white/20"
            )}
          >
            <StageIcon iconKey={key} className="h-7 w-7" colored />
          </button>
        );
      })}
    </div>
  );
}
