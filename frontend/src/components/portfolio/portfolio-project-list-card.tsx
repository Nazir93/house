import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import type { ProjectListItem } from "@/lib/get-projects";
import { isGifUrl } from "@/components/editorial/editorial-banner";

function isRasterUrl(url: string): boolean {
  return /\.(png|jpe?g|webp|gif|avif|bmp)(\?.*)?$/i.test(url) || isGifUrl(url);
}

function listCardThumbSrc(project: ProjectListItem): string | null {
  const cover = project.coverImage?.trim();
  if (cover) return cover;
  const v = project.videoUrl?.trim();
  if (v && isRasterUrl(v)) return v;
  return null;
}

function thumbUnoptimized(src: string): boolean {
  return isGifUrl(src) || /\.gif(\?.*)?$/i.test(src) || /\.svg(\?.*)?$/i.test(src);
}

/** Карточка списка портфолио (дизайн страницы «Наши проекты» / старый формат Гарант Монтаж). */
export function PortfolioProjectListCard({ project, revealStyle }: { project: ProjectListItem; revealStyle?: CSSProperties }) {
  const thumbSrc = listCardThumbSrc(project);

  return (
    <Link
      href={`/portfolio/${project.slug}`}
      data-reveal="card"
      className="group block cursor-pointer overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ border: "1px solid var(--border)", ...revealStyle }}
    >
      <div className="flex items-center gap-5 md:gap-8 p-4 md:p-6">
        <div
          className="shrink-0 w-28 h-20 md:w-40 md:h-28 rounded-xl overflow-hidden flex items-center justify-center relative"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          {thumbSrc ? (
            <Image
              src={thumbSrc}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
              sizes="160px"
              unoptimized={thumbUnoptimized(thumbSrc)}
            />
          ) : (
            <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-subtle)" }}>
              Фото
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-3 md:mb-4 flex-wrap">
            <h3
              className="font-heading text-xl md:text-2xl lg:text-3xl tracking-tight transition-colors duration-200 group-hover:text-[var(--accent)]"
              style={{ color: "var(--text)" }}
            >
              {project.title}
            </h3>
            <span className="text-sm shrink-0" style={{ color: "var(--text-muted)" }}>
              ({project.year})
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-10">
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.1em] block mb-0.5 font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                Отрасль
              </span>
              <span className="text-xs uppercase tracking-[0.05em]" style={{ color: "var(--text-muted)" }}>
                {project.industry}
              </span>
            </div>
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.1em] block mb-0.5 font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                Тип проекта
              </span>
              <span className="text-xs uppercase tracking-[0.05em]" style={{ color: "var(--text-muted)" }}>
                {project.type}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <ArrowRight
            size={28}
            className="transition-transform duration-300 group-hover:translate-x-1"
            style={{ color: "var(--text)" }}
          />
        </div>
      </div>
    </Link>
  );
}
