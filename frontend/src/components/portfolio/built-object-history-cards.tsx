"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { BuiltObjectHistoryCard } from "@/lib/built-object-detail";
import { toggleExclusiveHistoryStage } from "@/lib/built-object-history-ui";
import { cn } from "@/lib/utils";

export function BuiltObjectHistoryCards({ cards }: { cards: BuiltObjectHistoryCard[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (cards.length === 0) return null;

  return (
    <div className="divide-y divide-[color-mix(in_srgb,var(--text)_8%,transparent)]">
      {cards.map((card, index) => {
        const isOpen = openId === card.id;
        const hasBody = Boolean(card.description?.trim());
        return (
          <article key={card.id} className="min-w-0 py-1 first:pt-0 last:pb-0">
            <button
              type="button"
              onClick={() => hasBody && setOpenId((prev) => toggleExclusiveHistoryStage(prev, card.id))}
              disabled={!hasBody}
              aria-expanded={isOpen}
              className={cn(
                "flex w-full min-w-0 items-center gap-3 rounded-xl px-1 py-3 text-left transition-colors sm:gap-3.5 sm:py-3.5",
                hasBody && "hover:bg-[color-mix(in_srgb,var(--text)_3%,transparent)]",
                isOpen && hasBody && "bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]",
                !hasBody && "cursor-default opacity-80",
              )}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tabular-nums leading-none text-[var(--accent-contrast)] sm:h-9 sm:w-9 sm:text-xs"
                style={{ backgroundColor: "var(--accent)" }}
                aria-hidden
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className="min-w-0 flex-1 break-words font-heading text-sm font-bold leading-snug [overflow-wrap:anywhere] sm:text-[15px]"
                style={{ color: "var(--text)" }}
              >
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
              ) : null}
            </button>

            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isOpen && hasBody ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="min-h-0 overflow-hidden">
                {hasBody ? (
                  <p
                    className="px-1 pb-3.5 pl-12 text-sm leading-relaxed whitespace-pre-line sm:pl-[3.25rem] sm:pb-4 sm:text-[15px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {card.description}
                  </p>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
