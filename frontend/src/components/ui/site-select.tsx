"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SiteSelectOption = { value: string; label: string };

const sizeStyles = {
  sm: "h-9 px-3 text-[12px] gap-1.5",
  md: "h-10 px-3.5 text-[13px] gap-2",
  lg: "h-12 px-4 text-sm gap-2",
} as const;

const variantStyles = {
  pill: {
    trigger:
      "rounded-full border font-medium shadow-[inset_0_1px_0_color-mix(in_srgb,var(--text)_4%,transparent)] " +
      "border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-[color-mix(in_srgb,var(--bg-secondary)_70%,var(--bg))] " +
      "text-[var(--text)] hover:border-[color-mix(in_srgb,var(--accent)_40%,transparent)] " +
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_35%,transparent)] " +
      "focus-visible:border-[color-mix(in_srgb,var(--accent)_50%,transparent)]",
    triggerActive:
      "border-[color-mix(in_srgb,var(--accent)_55%,transparent)] bg-[color-mix(in_srgb,var(--accent)_10%,var(--bg))] text-[var(--accent)]",
  },
  field: {
    trigger:
      "rounded-xl border font-medium w-full " +
      "border-[color-mix(in_srgb,var(--text)_10%,transparent)] bg-[color-mix(in_srgb,var(--bg-secondary)_80%,var(--bg))] " +
      "text-[var(--text)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--text)_5%,transparent)] " +
      "hover:border-[color-mix(in_srgb,var(--accent)_35%,transparent)] " +
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent)_30%,transparent)] " +
      "focus-visible:border-[color-mix(in_srgb,var(--accent)_45%,transparent)]",
    triggerActive: "",
  },
} as const;

const panelClass =
  "site-select-panel max-h-[min(18rem,70vh)] overflow-auto rounded-2xl border py-1.5 " +
  "border-[color-mix(in_srgb,var(--text)_10%,transparent)] " +
  "bg-[color-mix(in_srgb,var(--card-bg)_94%,var(--bg))] backdrop-blur-xl " +
  "shadow-[0_16px_48px_rgba(0,0,0,0.14),0_0_0_1px_color-mix(in_srgb,var(--text)_6%,transparent)]";

const optionClass =
  "mx-1.5 flex w-[calc(100%-0.75rem)] items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-[13px] " +
  "transition-colors duration-150 text-[var(--text)] " +
  "hover:bg-[color-mix(in_srgb,var(--accent)_9%,transparent)] " +
  "focus-visible:outline-none focus-visible:bg-[color-mix(in_srgb,var(--accent)_9%,transparent)]";

const optionSelectedClass =
  "bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] font-semibold text-[var(--accent)]";

export type SiteSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: SiteSelectOption[];
  placeholder?: string;
  /** Текст на кнопке, если выбранное значение не найдено в options */
  placeholderWhenEmpty?: string;
  /** Переопределить подпись на триггере (фильтры «Все» / выбранное значение) */
  getTriggerLabel?: (selected: SiteSelectOption | undefined) => string;
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  minPanelWidth?: number;
  id?: string;
  "aria-label"?: string;
};

export function SiteSelect({
  value,
  onValueChange,
  options,
  placeholder = "Выберите…",
  placeholderWhenEmpty,
  getTriggerLabel,
  variant = "pill",
  size = "md",
  active = false,
  disabled,
  className,
  triggerClassName,
  minPanelWidth = 168,
  id,
  "aria-label": ariaLabel,
}: SiteSelectProps) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);
  const display =
    getTriggerLabel?.(selected) ??
    selected?.label ??
    placeholderWhenEmpty ??
    placeholder;

  const updatePanelPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPanelStyle({
      top: r.bottom + 8,
      left: r.left,
      width: Math.max(r.width, minPanelWidth),
    });
  }, [minPanelWidth]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePanelPosition();
    const onScrollOrResize = () => updatePanelPosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      const portal = document.getElementById(listId);
      if (portal?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, listId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const v = variantStyles[variant];

  const listNode =
    open && panelStyle ? (
      <ul
        id={listId}
        role="listbox"
        className={panelClass}
        style={{
          position: "fixed",
          top: panelStyle.top,
          left: panelStyle.left,
          width: panelStyle.width,
          zIndex: 10050,
        }}
      >
        {options.map((o) => {
          const isSelected = o.value === value;
          return (
            <li key={o.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                className={cn(optionClass, isSelected && optionSelectedClass)}
                onClick={() => {
                  onValueChange(o.value);
                  setOpen(false);
                }}
              >
                <span className="min-w-0 truncate">{o.label}</span>
                {isSelected ? (
                  <Check size={16} strokeWidth={2.5} className="shrink-0 text-[var(--accent)]" aria-hidden />
                ) : (
                  <span className="w-4 shrink-0" aria-hidden />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    ) : null;

  return (
    <div ref={rootRef} className={cn("relative", variant === "field" && "w-full", className)}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "inline-flex min-w-0 max-w-full items-center justify-between transition-[border-color,background-color,box-shadow,color] duration-200",
          sizeStyles[size],
          v.trigger,
          (active || open) && v.triggerActive,
          disabled && "cursor-not-allowed opacity-50",
          triggerClassName
        )}
      >
        <span className="truncate">{display}</span>
        <ChevronDown
          size={size === "lg" ? 18 : 16}
          className={cn(
            "shrink-0 text-[var(--text-muted)] transition-transform duration-200",
            open && "rotate-180 text-[var(--accent)]"
          )}
          aria-hidden
        />
      </button>
      {typeof document !== "undefined" && listNode ? createPortal(listNode, document.body) : null}
    </div>
  );
}
