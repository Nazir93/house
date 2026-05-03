import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getBuiltObjectCover, type BuiltObjectItem } from "@/lib/construction-shared";

/** Карточка построенного объекта — тот же макет, что у списка коммерческих проектов, с полями под дома. */
export function BuiltObjectListCard({ object }: { object: BuiltObjectItem }) {
  const cover = getBuiltObjectCover(object);
  const thumbUrl = cover?.url ?? null;

  const aside =
    object.area != null
      ? `${object.area} м²`
      : object.buildTerm?.trim()
        ? object.buildTerm
        : object.location?.trim() || "";

  return (
    <Link
      href={`/portfolio/${object.slug}`}
      className="group rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg block"
      style={{ border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-5 md:gap-8 p-4 md:p-6">
        <div
          className="shrink-0 w-28 h-20 md:w-40 md:h-28 rounded-xl overflow-hidden flex items-center justify-center relative"
          style={{ backgroundColor: "var(--bg-secondary)" }}
        >
          {thumbUrl ? (
            <Image
              src={thumbUrl}
              alt={cover?.alt ? cover.alt : object.title}
              fill
              className="object-cover"
              sizes="160px"
              unoptimized={thumbUrl.startsWith("/uploads/")}
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
              {object.title}
            </h3>
            {aside ? (
              <span className="text-sm shrink-0" style={{ color: "var(--text-muted)" }}>
                ({aside})
              </span>
            ) : null}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-10">
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.1em] block mb-0.5 font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                Материал
              </span>
              <span className="text-xs uppercase tracking-[0.05em]" style={{ color: "var(--text-muted)" }}>
                {object.material}
              </span>
            </div>
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.1em] block mb-0.5 font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                Локация
              </span>
              <span className="text-xs uppercase tracking-[0.05em]" style={{ color: "var(--text-muted)" }}>
                {object.location?.trim() || "—"}
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
