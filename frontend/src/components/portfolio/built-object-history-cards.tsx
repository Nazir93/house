"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { BuiltObjectHistoryCard } from "@/lib/built-object-detail";
import { cn } from "@/lib/utils";

export function BuiltObjectHistoryCards({ cards }: { cards: BuiltObjectHistoryCard[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (cards.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 lg:grid lg:grid-cols-4 lg:gap-3 lg:auto-rows-min">
      {cards.map((card, index) => {
        const isOpen = expanded.has(card.id);
        const hasBody = Boolean(card.description?.trim());
        return (
          <article
            key={card.id}
            className={cn(
              "flex w-full min-w-0 flex-col overflow-hidden rounded-xl border p-3 shadow-[0_8px_24px_rgba(15,61,46,0.05)] transition-shadow duration-200 lg:p-4",
              "lg:min-w-0 lg:self-start",
              isOpen && hasBody && "shadow-[0_4px_20px_rgb(var(--accent-rgb)/0.06)]",
            )}
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
          >
            <button
              type="button"
              onClick={() => hasBody && toggle(card.id)}
              disabled={!hasBody}
              aria-expanded={isOpen}
              className={cn(
                "flex w-full min-w-0 items-start gap-2 text-left",
                !hasBody && "cursor-default",
              )}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold tabular-nums leading-none text-[var(--accent-contrast)] lg:h-8 lg:w-8 lg:rounded-lg lg:text-[11px]"
                style={{ backgroundColor: "var(--accent)" }}
                aria-hidden
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 break-words font-heading text-[11px] font-bold leading-[1.3] [overflow-wrap:anywhere] lg:text-xs",
                  !isOpen && "line-clamp-2",
                )}
                style={{ color: "var(--text)" }}
              >
                {card.title}
              </span>
              {hasBody ? (
                <ChevronDown
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)] transition-transform duration-200 lg:h-5 lg:w-5",
                    isOpen && "rotate-180",
                  )}
                  strokeWidth={2.25}
                  aria-hidden
                />
              ) : (
                <span className="mt-0.5 h-4 w-4 shrink-0 lg:h-5 lg:w-5" aria-hidden />
              )}
            </button>
            {isOpen && hasBody ? (
              <p
                className="mt-3 min-w-0 break-words pt-1 text-xs leading-[1.55] whitespace-pre-line [overflow-wrap:anywhere] lg:text-[13px]"
                style={{ color: "var(--text-muted)" }}
              >
                {card.description}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
