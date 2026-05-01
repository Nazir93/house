"use client";

import { useState, useRef, useEffect, useId, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

/** Поля и кнопки в одном стиле с формой «Ориентировочный расчёт» (модалка). */

export function FunnelInputField({
  label,
  error,
  children,
}: {
  label?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {label && (
        <label className="block text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--text-subtle)" }}>
          {label}
        </label>
      )}
      {children}
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

export type FunnelSelectOption = { value: string; label: string };

/** Кастомный список вместо нативного &lt;select&gt; — единый тёмный UI, без системного белого выпадающего окна */
export function FunnelSelect({
  label,
  error,
  options,
  placeholder = "Выберите",
  value,
  onChange,
  onBlur,
  disabled,
  variant = "underline",
  invalid,
  className,
}: {
  label?: string;
  error?: string;
  options: FunnelSelectOption[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  /** underline — нижняя граница; boxed — рамка+скругление; panel — без рамки у триггера (ячейка с внешней обводкой) */
  variant?: "underline" | "boxed" | "panel";
  invalid?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const triggerId = `${listId}-trigger`;

  const selected = options.find((o) => o.value === value);
  const display = selected?.label ?? (value ? String(value) : "");
  const showPlaceholder = !selected && !value;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onBlur]);

  const borderColor = invalid ? "#ef4444" : "var(--border)";

  const triggerStyle: CSSProperties =
    variant === "underline"
      ? {
          borderBottom: `1px solid ${borderColor}`,
          padding: "0.75rem 0",
          color: showPlaceholder ? "var(--text-muted)" : "var(--text)",
          backgroundColor: "transparent",
        }
      : variant === "panel"
        ? {
            padding: "0.875rem 1.25rem",
            paddingRight: "2.5rem",
            color: showPlaceholder ? "var(--text-muted)" : "var(--text)",
            backgroundColor: "var(--bg)",
            border: "none",
          }
        : {
            border: `1px solid ${borderColor}`,
            borderRadius: "12px",
            padding: "0.75rem 1rem",
            paddingRight: "2.25rem",
            color: showPlaceholder ? "var(--text-muted)" : "var(--text)",
            backgroundColor: "var(--bg)",
          };

  const triggerBtn = (
    <button
      type="button"
      id={triggerId}
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listId}
      onClick={() => !disabled && setOpen((o) => !o)}
      onBlur={() => {
        setTimeout(() => onBlur?.(), 0);
      }}
      className="touch-manipulation flex w-full items-center justify-between gap-2 text-left text-base sm:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:opacity-50"
      style={triggerStyle}
    >
      <span className="min-w-0 truncate">{showPlaceholder ? placeholder : display}</span>
      <ChevronDown
        size={18}
        className="shrink-0 transition-transform duration-200"
        style={{
          color: "var(--text-muted)",
          transform: open ? "rotate(180deg)" : undefined,
        }}
        aria-hidden
      />
    </button>
  );

  return (
    <div className={`relative ${className ?? ""}`} ref={rootRef}>
      {label && (
        <label
          className="mb-2 block text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "var(--text-subtle)" }}
          htmlFor={triggerId}
        >
          {label}
        </label>
      )}
      {triggerBtn}
      {open && !disabled && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-[100] mt-1 max-h-60 overflow-y-auto rounded-xl py-1 shadow-xl"
          style={{
            border: "1px solid var(--border)",
            backgroundColor: "var(--card-bg)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
          }}
        >
          {options.map((opt) => {
            const isActive = opt.value === value;
            const optKey = opt.value === "" ? "__empty" : opt.value;
            return (
              <li key={optKey} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className="w-full px-4 py-2.5 text-left text-sm transition-colors"
                  style={{
                    color: "var(--text)",
                    backgroundColor: isActive ? "rgba(15,61,46,0.12)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isActive ? "rgba(15,61,46,0.12)" : "transparent";
                  }}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    onBlur?.();
                  }}
                >
                  {opt.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

/** Цвет текста/иконки на заливке из var(--text): в WebKit на мобильных нужен и -webkit-text-fill-color */
function funnelHoverFg(hovered: boolean, disabled?: boolean): CSSProperties {
  if (disabled || !hovered) {
    return { color: "var(--text)", WebkitTextFillColor: "var(--text)" };
  }
  return { color: "var(--bg)", WebkitTextFillColor: "var(--bg)" };
}

export function FunnelFillButton({
  children,
  onClick,
  type = "button",
  disabled,
  icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  const fill = hovered && !disabled;
  const fg = funnelHoverFg(fill, disabled);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className="w-full flex items-center justify-between px-6 py-5 sm:px-8 sm:py-6 text-lg sm:text-xl md:text-2xl font-heading transition-all duration-500 relative overflow-hidden disabled:opacity-50 isolate"
      style={{ border: "1px solid var(--border)", borderRadius: "20px", color: "var(--text)" }}
    >
      <div
        className="absolute inset-0 origin-left transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] pointer-events-none"
        style={{
          backgroundColor: "var(--text)",
          transform: fill ? "scaleX(1)" : "scaleX(0)",
          borderRadius: "20px",
        }}
        aria-hidden
      />
      <span
        className="relative z-10 transition-[color] duration-700 flex items-center gap-3 min-w-0"
        style={fg}
      >
        {icon}
        {children}
      </span>
      <ArrowRight
        size={22}
        className="relative z-10 shrink-0 transition-[color] duration-700"
        style={fg}
      />
    </button>
  );
}

/** Как FillButton, но для Next Link — без лишних «карточных» рамок вокруг блока. */
export function FunnelLinkRow({
  href,
  children,
  icon,
  trailing,
  download,
  onVideo,
  compact,
  dense,
  /** Уже по ширине/высоте, тот же размер текста что у onVideo+compact (оффер: «Скачать прайс») */
  narrow,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Скачивание файла (например PDF) — рендер &lt;a&gt;, не Next Link */
  download?: boolean | string;
  /** Светлый текст и рамка поверх тёмного видео */
  onVideo?: boolean;
  /** Уменьшенные отступы — чтобы влезало в экран без прокрутки */
  compact?: boolean;
  /** Ещё плотнее (оффер-видео): один экран без прокрутки */
  dense?: boolean;
  narrow?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const pad =
    dense && compact
      ? "px-2.5 py-2 sm:px-3 sm:py-2"
      : narrow && compact && onVideo
        ? "px-2.5 py-2 sm:px-3 sm:py-2.5"
        : compact
          ? "px-4 py-3 sm:px-6 sm:py-4"
          : "px-6 py-5 sm:px-8 sm:py-6";
  const gapClass =
    dense && compact ? "gap-2" : narrow && compact && onVideo ? "gap-2" : onVideo && compact ? "gap-2.5" : "gap-3";
  const textSize =
    dense && compact
      ? "text-[11px] sm:text-xs md:text-sm"
      : compact
        ? "text-xs sm:text-sm md:text-base"
        : "text-base sm:text-lg md:text-xl";
  const onVideoAlign = onVideo ? "items-center normal-case" : "items-center";
  const onVideoOverflow = onVideo ? "overflow-visible" : "overflow-hidden";
  const className =
    `flex w-full min-w-0 justify-between ${gapClass} ${pad} text-left ${textSize} font-heading transition-all duration-500 relative ${onVideoOverflow} ${onVideoAlign}`;
  const borderRadius = dense && compact ? "14px" : narrow && compact && onVideo ? "14px" : "20px";
  const styleDefault = {
    border: "1px solid var(--border)",
    borderRadius,
  };
  /** Поверх карточки/видео: рамка и текст из темы — одинаково в light/dark */
  const styleOnVideo = {
    border: hovered ? "1px solid var(--accent)" : "1px solid var(--border)",
    borderRadius,
    backgroundColor: hovered ? "rgba(15,61,46,0.1)" : "transparent",
    transition: "background-color 0.2s ease, border-color 0.2s ease",
  };

  const linkFg = funnelHoverFg(hovered, false);
  const innerDefault = (
    <>
      <div
        className="absolute inset-0 origin-left transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] pointer-events-none"
        style={{
          backgroundColor: "var(--text)",
          transform: hovered ? "scaleX(1)" : "scaleX(0)",
          borderRadius,
        }}
        aria-hidden
      />
      <span
        className="relative z-10 flex min-w-0 items-center gap-3 transition-[color] duration-700"
        style={linkFg}
      >
        {icon}
        <span className="min-w-0 leading-tight">{children}</span>
      </span>
      <span className="relative z-10 shrink-0 transition-[color] duration-700" style={linkFg}>
        {trailing ?? <ArrowRight size={22} />}
      </span>
    </>
  );

  /** Поверх видео: без белой заливки — иначе белый текст и подписи пропадают */
  const iconGap =
    dense && compact ? "gap-2" : narrow && compact && onVideo ? "gap-2" : onVideo && compact ? "gap-2.5" : "gap-3";
  const arrowSize =
    dense && compact ? 16 : narrow && compact && onVideo ? 16 : onVideo && compact ? 18 : 22;
  const innerOnVideo = (
    <>
      <span
        className={`relative z-10 flex min-w-0 flex-1 items-center ${iconGap}`}
        style={{ color: "var(--text)", WebkitTextFillColor: "var(--text)" }}
      >
        <span className="shrink-0 text-[#e8c96a] [&_svg]:text-current">{icon}</span>
        <span className="min-w-0 flex-1 whitespace-normal break-words leading-snug">{children}</span>
      </span>
      <span
        className="relative z-10 shrink-0"
        style={{ color: "var(--text-muted)", WebkitTextFillColor: "var(--text-muted)" }}
      >
        {trailing ?? <ArrowRight size={arrowSize} />}
      </span>
    </>
  );

  const inner = onVideo ? innerOnVideo : innerDefault;
  const mergedStyle = onVideo ? styleOnVideo : styleDefault;

  if (download !== undefined) {
    return (
      <a
        href={href}
        download={download === true ? "" : download}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        className={`${className} isolate`}
        style={mergedStyle}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link
      href={href}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={`${className} isolate`}
      style={mergedStyle}
    >
      {inner}
    </Link>
  );
}

/** То же для кнопки (раскрытие блока и т.д.). */
export function FunnelPanelButton({
  children,
  onClick,
  icon,
  trailing,
  ariaExpanded,
  onVideo,
  compact,
  dense,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  ariaExpanded?: boolean;
  onVideo?: boolean;
  compact?: boolean;
  dense?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const pad =
    dense && compact
      ? "px-2.5 py-2 sm:px-3 sm:py-2"
      : compact
        ? "px-4 py-3 sm:px-6 sm:py-4"
        : "px-6 py-5 sm:px-8 sm:py-6";
  const gapClass = dense && compact ? "gap-2" : onVideo && compact ? "gap-2.5" : "gap-3";
  const textSize =
    dense && compact
      ? "text-[11px] sm:text-xs md:text-sm"
      : compact
        ? "text-xs sm:text-sm md:text-base"
        : "text-base sm:text-lg md:text-xl";
  const borderRadius = dense && compact ? "14px" : "20px";

  if (onVideo) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-expanded={ariaExpanded}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        className={`flex w-full min-w-0 cursor-pointer items-center justify-between normal-case ${gapClass} text-left ${textSize} font-heading relative overflow-visible ${pad}`}
        style={{
          border: hovered ? "1px solid var(--accent)" : "1px solid var(--border)",
          borderRadius,
          backgroundColor: hovered ? "rgba(15,61,46,0.1)" : "transparent",
          transition: "background-color 0.2s ease, border-color 0.2s ease",
        }}
      >
        <span
          className={`relative z-10 flex min-w-0 flex-1 items-center ${dense && compact ? "gap-2" : onVideo && compact ? "gap-2.5" : "gap-3"}`}
          style={{ color: "var(--text)", WebkitTextFillColor: "var(--text)" }}
        >
          <span className="shrink-0 text-[#e8c96a] [&_svg]:text-current">{icon}</span>
          <span className="min-w-0 flex-1 whitespace-normal break-words leading-snug">{children}</span>
        </span>
        <span
          className="relative z-10 shrink-0"
          style={{ color: "var(--text-muted)", WebkitTextFillColor: "var(--text-muted)" }}
        >
          {trailing ?? <ArrowRight size={dense && compact ? 16 : onVideo && compact ? 18 : 22} />}
        </span>
      </button>
    );
  }

  const panelFg = funnelHoverFg(hovered, false);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={ariaExpanded}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={`flex w-full min-w-0 cursor-pointer items-center justify-between gap-3 bg-transparent text-left ${textSize} font-heading transition-all duration-500 relative overflow-hidden isolate ${pad}`}
      style={{ border: "1px solid var(--border)", borderRadius, color: "var(--text)" }}
    >
      <div
        className="absolute inset-0 origin-left transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] pointer-events-none"
        style={{
          backgroundColor: "var(--text)",
          transform: hovered ? "scaleX(1)" : "scaleX(0)",
          borderRadius,
        }}
        aria-hidden
      />
      <span className="relative z-10 flex min-w-0 items-center gap-3 transition-[color] duration-700" style={panelFg}>
        {icon}
        <span className="min-w-0 leading-tight">{children}</span>
      </span>
      <span className="relative z-10 shrink-0 transition-[color] duration-700" style={panelFg}>
        {trailing ?? <ArrowRight size={22} />}
      </span>
    </button>
  );
}
