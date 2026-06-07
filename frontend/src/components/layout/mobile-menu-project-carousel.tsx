"use client";

import Link from "next/link";
import { CmsImage } from "@/components/ui/cms-image";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type MenuProject = {
  id: string;
  slug: string;
  title: string;
  area: number;
  price: number;
  cover: string;
  alt: string;
};

function formatPriceMln(priceRub: number): string {
  const mln = priceRub / 1_000_000;
  return `${mln.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} млн`;
}

export function MobileMenuProjectCarousel({
  active,
  onClose,
  className,
}: {
  active: boolean;
  onClose: () => void;
  className?: string;
}) {
  const [projects, setProjects] = useState<MenuProject[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    setLoading(true);

    fetch("/api/public/menu-projects", { credentials: "same-origin" })
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.projects?.length) return;
        setProjects(data.projects as MenuProject[]);
        setIndex(0);
      })
      .catch(() => {
        if (!cancelled) setProjects([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [active]);

  if (!active) return null;

  const current = projects[index];

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-[1.35rem] border",
        className,
      )}
      style={{
        borderColor: "var(--border)",
        backgroundColor: "color-mix(in srgb, var(--bg-secondary) 72%, var(--bg))",
      }}
      aria-label="Популярные проекты"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 px-3 pb-2 pt-3 sm:px-4">
        <div className="min-w-0">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: "var(--text-subtle)" }}
          >
            Проекты
          </p>
          <p className="truncate font-heading text-sm font-bold" style={{ color: "var(--text)" }}>
            {loading ? "Загрузка…" : current?.title ?? "Каталог домов"}
          </p>
        </div>
        <Link
          href="/projects"
          onClick={onClose}
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold transition hover:text-[var(--accent)]"
          style={{ color: "var(--text-muted)" }}
        >
          Все
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <div className="relative min-h-0 flex-1 px-3 pb-3 sm:px-4 sm:pb-4">
        {current ? (
          <Link
            href={`/projects/${current.slug}`}
            onClick={onClose}
            className="group relative block h-full min-h-[7.25rem] overflow-hidden rounded-[1.15rem] shadow-[0_14px_40px_rgba(15,61,46,0.14)] sm:min-h-[9.5rem] md:min-h-[11rem]"
          >
            <CmsImage
              src={current.cover}
              alt={current.alt}
              fill
              className="object-cover object-[center_38%] transition duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 1023px) 92vw, 420px"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/12 to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
              <p className="font-heading text-base font-bold uppercase tracking-tight text-white sm:text-lg">
                {current.title}
              </p>
              <p className="mt-1 text-xs text-white/78 sm:text-sm">
                {current.area} м²
                {current.price > 0 ? ` · от ${formatPriceMln(current.price)}` : null}
              </p>
            </div>
          </Link>
        ) : (
          <div
            className="flex h-full min-h-[7.25rem] items-center justify-center rounded-[1.15rem] border border-dashed px-4 text-center text-sm sm:min-h-[9.5rem] md:min-h-[11rem]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            {loading ? "Подбираем проекты…" : "Откройте каталог проектов на сайте"}
          </div>
        )}

        {projects.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + projects.length) % projects.length)}
              className="absolute left-5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border bg-[var(--bg)]/88 shadow-md backdrop-blur-sm transition hover:border-[var(--accent)]"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
              aria-label="Предыдущий проект"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % projects.length)}
              className="absolute right-5 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border bg-[var(--bg)]/88 shadow-md backdrop-blur-sm transition hover:border-[var(--accent)]"
              style={{ borderColor: "var(--border)", color: "var(--text)" }}
              aria-label="Следующий проект"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {projects.length > 1 ? (
        <div className="flex shrink-0 items-center justify-center gap-1.5 px-3 pb-3">
          {projects.map((project, dotIndex) => (
            <button
              key={project.id}
              type="button"
              onClick={() => setIndex(dotIndex)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                dotIndex === index ? "w-5 bg-[var(--accent)]" : "w-1.5 bg-[var(--border)]",
              )}
              aria-label={`Проект ${project.title}`}
              aria-current={dotIndex === index}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
