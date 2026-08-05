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
    <div className="flex flex-col gap-2 sm:gap-2.5">
      {cards.map((card, index) => {
        const isOpen = openId === card.id;
        const hasBody = Boolean(card.description?.trim());
        return (
          <article
            key={card.id}
            className={cn(
              "overflow-hidden rounded-2xl border transition-[border-color,box-shadow] duration-200",
              isOpen && hasBody
                ? "shadow-[0_10px_28px_rgba(15,61,46,0.08)]"
                : "shadow-[0_6px_18px_rgba(15,61,46,0.04)]",
            )}
            style={{
              borderColor:
                isOpen && hasBody
                  ? "color-mix(in srgb, var(--accent) 35%, var(--border))"
                  : "var(--border)",
              backgroundColor: "var(--bg)",
            }}
          >
            <button
              type="button"
              onClick={() => hasBody && setOpenId((prev) => toggleExclusiveHistoryStage(prev, card.id))}
              disabled={!hasBody}
              aria-expanded={isOpen}
              className={cn(
                "flex w-full min-w-0 items-center gap-3 px-3.5 py-3 text-left sm:gap-3.5 sm:px-4 sm:py-3.5",
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
                    className="border-t px-3.5 pb-3.5 pt-3 text-sm leading-relaxed whitespace-pre-line sm:px-4 sm:pb-4 sm:pt-3.5 sm:text-[15px]"
                    style={{
                      color: "var(--text-muted)",
                      borderColor: "color-mix(in srgb, var(--border) 70%, transparent)",
                    }}
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
