"use client";

import Image from "next/image";
import Link from "next/link";
import { getBuiltObjectCover, type BuiltObjectItem } from "@/lib/construction-shared";
import { mapBuiltObjectToHomeCard } from "@/lib/home-built-homes-block";
import { resolveBuiltObjectCoverAlt } from "@/lib/seo/built-object-image-seo";
import { revealDelayStyle } from "@/lib/reveal-animation";
import { cn } from "@/lib/utils";

/**
 * Сетка карточек главной (ТЗ SEO §5): место / факты / статус → `/portfolio/[slug]`.
 * Данные те же, что в каталоге построенных домов.
 */
export function HomeBuiltHomesGrid({ objects }: { objects: BuiltObjectItem[] }) {
  if (objects.length === 0) return null;

  return (
    <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {objects.map((object, index) => {
        const card = mapBuiltObjectToHomeCard(object);
        const cover = getBuiltObjectCover(object);
        const imgUrl = cover?.url ?? null;

        return (
          <li key={object.id} data-reveal="card" style={revealDelayStyle(index)}>
            <Link
              href={card.href}
              className="group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-[var(--border)] bg-[var(--card-bg)] shadow-[0_10px_34px_rgba(15,61,46,0.06)] transition duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_35%,var(--border))] hover:shadow-[0_18px_46px_rgba(15,61,46,0.12)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.28)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-secondary)]">
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={resolveBuiltObjectCoverAlt(object, cover?.alt)}
                    title={resolveBuiltObjectCoverAlt(object, cover?.alt)}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-wider text-[var(--text-subtle)]">
                    Фото объекта
                  </div>
                )}
                <span
                  className={cn(
                    "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]",
                    object.siteStatus === "UNDER_CONSTRUCTION"
                      ? "bg-[color-mix(in_srgb,var(--accent)_18%,var(--card-bg))] text-[var(--accent)]"
                      : "bg-[var(--card-bg)]/92 text-[var(--text)]",
                  )}
                >
                  {card.status}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 px-4 py-3.5 sm:px-4 sm:py-4">
                <p className="font-heading text-[13px] font-bold uppercase leading-snug tracking-[0.04em] text-[var(--text)] sm:text-sm">
                  {card.place}
                </p>
                {card.facts ? (
                  <p className="text-[12px] leading-relaxed text-[var(--text-muted)] sm:text-[13px]">{card.facts}</p>
                ) : null}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
