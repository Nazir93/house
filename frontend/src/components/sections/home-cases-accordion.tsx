"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { getBuiltObjectCover, builtObjectMaterialLabel, type BuiltObjectItem } from "@/lib/construction-shared";
import { revealDelayStyle } from "@/lib/reveal-animation";
import { cn } from "@/lib/utils";

function caseCategory(object: BuiltObjectItem): string {
  const mat = builtObjectMaterialLabel(object.material).toUpperCase();
  const loc = object.location?.trim();
  if (loc) {
    const head = loc.split(",")[0]?.trim() ?? loc;
    return `ЗАГОРОДНЫЙ ДОМ, ${mat}, ${head.toUpperCase()}`;
  }
  return `ЗАГОРОДНЫЙ ДОМ, ${mat}`;
}

function expandBodyText(object: BuiltObjectItem): string {
  const w = object.worksDescription?.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (w) return w;
  return object.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function CaseRow({
  object,
  index,
  isOpen,
  onToggle,
}: {
  object: BuiltObjectItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const cover = getBuiltObjectCover(object);
  const imgUrl = cover?.url ?? null;
  const category = caseCategory(object);
  const year = object.year?.trim() || "—";

  useEffect(() => {
    if (!contentRef.current) return;
    setHeight(isOpen ? contentRef.current.scrollHeight : 0);
  }, [isOpen, object.slug, object.description, object.worksDescription, imgUrl]);

  useEffect(() => {
    if (!isOpen || !contentRef.current) return;
    const ro = new ResizeObserver(() => {
      if (contentRef.current) setHeight(contentRef.current.scrollHeight);
    });
    ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [isOpen]);

  return (
    <div data-reveal="card" className="group border-b" style={{ borderColor: "var(--border)", ...revealDelayStyle(index) }}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-col gap-2 py-5 text-left md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_auto] md:items-start md:gap-6 md:py-6"
      >
        <span
          className={cn(
            "font-heading text-[12px] font-semibold uppercase leading-snug tracking-[0.06em] transition-colors md:text-[13px]",
            isOpen ? "text-[var(--accent)]" : "text-[var(--text)]",
          )}
        >
          {object.title.toUpperCase()}
        </span>
        <span
          className="max-w-xl text-[10px] font-medium uppercase leading-snug tracking-[0.08em] text-[var(--text-muted)] md:text-[11px]"
          style={{ wordBreak: "break-word" }}
        >
          {category}
        </span>
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--text-muted)] tabular-nums md:justify-self-end md:pt-0.5 md:text-[11px]">
          ({year})
        </span>
      </button>

      <div
        className="overflow-hidden transition-[height] duration-500 ease-in-out"
        style={{ height: `${height}px` }}
      >
        <div ref={contentRef} className="pb-8 pt-0 md:pb-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,460px)] md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)]">
            <div className="flex max-w-xl flex-col">
              <p className="text-[13px] leading-relaxed md:text-sm" style={{ color: "var(--text-muted)" }}>
                {expandBodyText(object)}
              </p>
              <Link
                href={`/portfolio/${object.slug}`}
                className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors hover:text-[var(--accent)]"
                style={{ color: "var(--text)" }}
              >
                подробнее
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
            <div
              className={cn(
                "relative mx-auto w-full max-w-full overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--bg-secondary)] shadow-[0_12px_40px_rgba(15,61,46,0.06)] md:mx-0",
                "aspect-[16/10] md:aspect-[16/9]",
              )}
            >
              {imgUrl ? (
                <Image
                  src={imgUrl}
                  alt={cover?.alt ? cover.alt : object.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 540px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-wider text-[var(--text-subtle)]">
                  Фото объекта
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeCasesAccordion({ objects }: { objects: BuiltObjectItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (objects.length === 0) return null;

  return (
    <div className="w-full">
      <div className="border-t" style={{ borderColor: "var(--border)" }}>
        {objects.map((object, index) => (
          <CaseRow
            key={object.id}
            object={object}
            index={index}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
          />
        ))}
      </div>
    </div>
  );
}
