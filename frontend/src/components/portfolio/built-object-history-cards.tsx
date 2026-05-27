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
    <div
      className={cn(
        "flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "lg:grid lg:grid-cols-4 lg:gap-3 lg:overflow-visible lg:snap-none lg:pb-0 lg:auto-rows-min",
      )}
    >
      {cards.map((card, index) => {
        const isOpen = expanded.has(card.id);
        const hasBody = Boolean(card.description?.trim());
        return (
          <article
            key={card.id}
            className={cn(
              "flex w-[min(82vw,272px)] shrink-0 snap-start flex-col rounded-xl border p-4 transition-shadow duration-200",
              "lg:w-auto lg:min-w-0 lg:self-start",
              isOpen && hasBody && "shadow-[0_6px_24px_rgb(var(--accent-rgb)/0.07)]",
            )}
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}
          >
            <button
              type="button"
              onClick={() => hasBody && toggle(card.id)}
              disabled={!hasBody}
              aria-expanded={isOpen}
              className={cn(
                "flex w-full items-center gap-3 text-left",
                !hasBody && "cursor-default",
              )}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tabular-nums leading-none text-[var(--accent-contrast)]"
                style={{ backgroundColor: "var(--accent)" }}
                aria-hidden
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 font-heading text-sm font-bold leading-snug" style={{ color: "var(--text)" }}>
                {card.title}
              </span>
              {hasBody ? (
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-[var(--accent)] transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                  strokeWidth={2.25}
                  aria-hidden
                />
              ) : (
                <span className="h-5 w-5 shrink-0" aria-hidden />
              )}
            </button>
            {isOpen && hasBody ? (
              <p
                className="mt-3 border-t pt-3 text-[13px] leading-[1.55] whitespace-pre-line"
                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
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
