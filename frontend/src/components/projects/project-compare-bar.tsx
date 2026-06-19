"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectCompareOptional } from "@/lib/project-compare-context";
import { PROJECT_COMPARE_PAGE_PATH } from "@/lib/project-compare";

function ruProjectsInCompare(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} проект в сравнении`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} проекта в сравнении`;
  }
  return `${count} проектов в сравнении`;
}

export function ProjectCompareBar() {
  const pathname = usePathname();
  const compare = useProjectCompareOptional();

  if (!compare?.hydrated || compare.count === 0) return null;
  if (pathname.startsWith(PROJECT_COMPARE_PAGE_PATH)) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 z-[85] flex justify-center px-4",
        "bottom-[calc(var(--mobile-bottom-nav-offset,4.5rem)+0.75rem)] lg:bottom-8",
      )}
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex max-w-lg items-center gap-2 rounded-full bg-[#0f3d2e] py-2 pl-2 pr-3 text-white shadow-[0_12px_40px_rgba(15,61,46,0.35)]">
        <button
          type="button"
          onClick={() => compare.clear()}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
          aria-label="Очистить список сравнения"
          title="Очистить"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
        <Link
          href={compare.compareHref}
          className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 px-2 text-sm font-semibold"
        >
          <span className="truncate">{ruProjectsInCompare(compare.count)}</span>
          <ArrowRight className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
