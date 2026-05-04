"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { HOME_BLOG_PREVIEW_FALLBACK, type HomeBlogPreviewItem } from "@/lib/get-home-blog-preview";
import { cn } from "@/lib/utils";

/**
 * Общая «дуга» между колонками: правая граница 1-й = левая 2-й (зеркально 86% / 14%).
 * Везде одна формула — на мобилке карточки на всю ширину, края тоже волнообразные.
 */
const CARD_CLIP = [
  "path('M 0 0 L 100% 0 Q 82% 50% 100% 100% L 0 100% Z')",
  "path('M 0 0 L 100% 0 Q 82% 50% 100% 100% L 0 100% Q 18% 50% 0 0 Z')",
  "path('M 0 0 L 100% 0 L 100% 100% L 0 100% Q 18% 50% 0 0 Z')",
] as const;

function NewsCard({ post, href, index }: { post: HomeBlogPreviewItem; href: string; index: number }) {
  /** По-монтовому вход (без IntersectionObserver), чтобы блок не был «прозрачным» после скролла. */
  const [entered, setEntered] = useState(false);
  const clip = CARD_CLIP[Math.min(index, 2)];

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <Link
      href={href}
      className={cn(
        "group relative block min-h-[240px] transition-[opacity,transform,filter] duration-700 ease-out sm:min-h-[260px] md:min-h-[280px]",
        "[filter:drop-shadow(0_10px_28px_rgba(15,61,46,0.1))] dark:[filter:drop-shadow(0_10px_26px_rgba(0,0,0,0.35))]",
        "hover:-translate-y-1 hover:[filter:drop-shadow(0_16px_38px_rgba(15,61,46,0.16))] dark:hover:[filter:drop-shadow(0_16px_36px_rgba(0,0,0,0.45))]",
      )}
      style={{
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${(index % 3) * 80}ms`,
      }}
    >
      <div
        className={cn(
          "flex h-full min-h-[inherit] flex-col justify-between overflow-hidden p-5 sm:p-6 md:p-7",
          "border border-[var(--border)] bg-[var(--bg)]",
          "max-lg:rounded-[22px] lg:rounded-none",
        )}
        style={{
          clipPath: clip,
          WebkitClipPath: clip,
        }}
      >
        <div className="flex justify-end">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-secondary)]/50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          >
            <ArrowRight size={17} style={{ color: "var(--text)" }} />
          </div>
        </div>

        <div className="relative z-10 mt-4">
          <h3
            className="mb-3 text-balance font-heading text-[1.05rem] font-bold leading-snug tracking-tight transition-colors duration-200 group-hover:text-[var(--accent)] sm:text-[1.1rem] md:text-[1.15rem]"
            style={{ color: "var(--text)" }}
          >
            {post.title}
          </h3>
          <p className="line-clamp-3 text-[13px] leading-relaxed sm:text-sm" style={{ color: "var(--text-muted)" }}>
            {post.excerpt}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function HomeNewsFeed({ posts }: { posts: HomeBlogPreviewItem[] }) {
  const safe = posts?.length ? posts : HOME_BLOG_PREVIEW_FALLBACK;
  const items = safe.slice(0, 3);

  return (
    <section
      id="news"
      className="border-t border-[var(--border)] py-11 sm:py-14 md:py-[4.25rem]"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="container mx-auto max-w-[1180px] px-5">
        <div className="mb-8 flex flex-col gap-5 md:mb-9">
          <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <h2 className="min-w-0 w-full flex-1 text-balance font-heading text-2xl font-bold tracking-tight text-[var(--text)] sm:text-3xl md:text-[2.25rem] md:leading-[1.1]">
              Новостная лента
            </h2>
            <Link
              href="/blog"
              className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[var(--text)] underline-offset-4 transition hover:text-[var(--accent)] hover:underline sm:mt-1 sm:text-sm"
            >
              Все новости
              <ArrowUpRight className="h-4 w-4 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
            </Link>
          </div>
        </div>

        {/* Стыковка без зазора — кривые соседних карточек совпадают */}
        <div className="grid grid-cols-1 gap-8 sm:gap-9 lg:grid-cols-3 lg:gap-0">
          {items.map((post, i) => (
            <div key={post.id} className="relative min-w-0 lg:min-h-[300px]">
              <NewsCard
                post={post}
                index={i}
                href={post.slug?.trim() ? `/blog/${post.slug}` : "/blog"}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
