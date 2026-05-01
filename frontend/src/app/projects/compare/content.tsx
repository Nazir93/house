"use client";

import Link from "next/link";
import { Fragment } from "react";
import { Trash2 } from "lucide-react";
import { removeComparedProject, useComparedProjectIds } from "@/components/construction/compare-button";
import { formatRub, getProjectRenders, type HouseProjectItem } from "@/lib/construction-shared";

export function CompareProjectsContent({ projects }: { projects: HouseProjectItem[] }) {
  const ids = useComparedProjectIds();
  const selected = projects.filter((project) => ids.includes(project.id));
  const rows = [
    ["Цена", (p: HouseProjectItem) => formatRub(p.price)],
    ["Площадь", (p: HouseProjectItem) => `${p.area} м²`],
    ["Этажность", (p: HouseProjectItem) => `${p.floors}`],
    ["Комнаты", (p: HouseProjectItem) => `${p.rooms}`],
    ["Санузлы", (p: HouseProjectItem) => `${p.bathrooms}`],
    ["Материалы", (p: HouseProjectItem) => p.materials.join(", ") || "на выбор"],
  ] as const;

  return (
    <section className="min-h-screen pt-28 pb-20" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
      <div className="container mx-auto px-5">
        <div className="max-w-3xl">
          <span className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em]" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            Сравнение
          </span>
          <h1 className="mt-5 font-heading text-4xl md:text-6xl">Сравнение проектов домов</h1>
          <p className="mt-4 text-lg" style={{ color: "var(--text-muted)" }}>Можно сравнить до 4 проектов и перейти в карточку выбранного дома.</p>
        </div>

        {selected.length === 0 ? (
          <div className="mt-10 rounded-[28px] border p-8" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-secondary)" }}>
            <p className="text-lg font-semibold">В сравнении пока нет проектов.</p>
            <Link href="/projects" className="mt-5 inline-flex rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ backgroundColor: "var(--accent)" }}>
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            <h2 className="font-heading text-2xl md:text-3xl">Общие параметры</h2>
            <div className="overflow-x-auto rounded-[28px] border" style={{ borderColor: "var(--border)" }}>
              <div className="min-w-[760px]">
                <div className="grid" style={{ gridTemplateColumns: `220px repeat(${selected.length}, minmax(200px, 1fr))` }}>
                  <div className="p-4 font-semibold" style={{ backgroundColor: "var(--bg-secondary)" }}>
                    Параметр
                  </div>
                  {selected.map((project) => {
                    const cover = getProjectRenders(project)[0];
                    return (
                      <div key={project.id} className="p-4" style={{ backgroundColor: "var(--bg-secondary)" }}>
                        <Link href={`/projects/${project.slug}`} className="block">
                          <div
                            className="relative mb-3 aspect-[4/3] overflow-hidden rounded-2xl border bg-[var(--stone)]"
                            style={{ borderColor: "var(--border)" }}
                          >
                            {cover ? (
                              <img src={cover.url} alt={project.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-[var(--text-muted)]">Нет фото</div>
                            )}
                          </div>
                          <p className="font-heading text-lg leading-snug text-[var(--accent)] md:text-xl">{project.title}</p>
                          <p className="mt-1 text-sm font-semibold tabular-nums text-[var(--text)]">{formatRub(project.price)}</p>
                        </Link>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Link
                            href={`/projects/${project.slug}`}
                            className="inline-flex rounded-full px-4 py-2 text-xs font-semibold text-white"
                            style={{ backgroundColor: "var(--accent)" }}
                          >
                            Открыть проект
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeComparedProject(project.id)}
                            className="rounded-full p-2 text-[var(--sale)]"
                            aria-label="Убрать из сравнения"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {rows.map(([label, getValue]) => (
                    <Fragment key={label}>
                      <div className="border-t p-4 text-sm font-semibold" style={{ borderColor: "var(--border)" }}>
                        {label}
                      </div>
                      {selected.map((project) => (
                        <div
                          key={`${project.id}-${label}`}
                          className="border-t p-4 text-sm"
                          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                        >
                          {getValue(project)}
                        </div>
                      ))}
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
