"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatArticleBody, PAGE_INTRO_PROSE_CLASS } from "@/lib/html-content";

type PostItem = {
  id: string;
  slug?: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
};

function PostCard({
  post,
  index,
}: {
  post: PostItem;
  index: number;
}) {
  const ref = useRef<HTMLDivElement & HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const inner = (
    <div
      className="relative overflow-hidden flex flex-col justify-between h-[360px] p-6 md:p-8 transition-transform duration-500 group-hover:scale-[0.98]"
      style={{
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: "20px",
      }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: 0.03 }}
      >
        <span
          className="font-heading text-[160px] leading-none select-none tabular-nums"
          style={{ color: "var(--text)" }}
        >
          {index + 1}
        </span>
      </div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] uppercase tracking-[0.15em] px-3 py-1 rounded-full"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            {post.category}
          </span>
          <span className="text-[10px] tracking-wider" style={{ color: "var(--text-subtle)" }}>
            {post.date}
          </span>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
          style={{ border: "1px solid var(--border)" }}
        >
          <ArrowRight size={16} style={{ color: "var(--text)" }} />
        </div>
      </div>

      <div className="relative z-10">
        <h3
          className="font-heading text-xl md:text-2xl leading-[1.1] mb-3 transition-colors duration-200 group-hover:text-[var(--accent)]"
          style={{ color: "var(--text)" }}
        >
          {post.title}
        </h3>
        <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--text-muted)" }}>
          {post.excerpt}
        </p>
      </div>
    </div>
  );

  const sharedStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(40px)",
    transitionDelay: `${(index % 3) * 100}ms`,
  };

  if (post.slug) {
    return (
      <Link
        href={`/blog/${post.slug}`}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className="group cursor-pointer transition-all duration-700 ease-out block"
        style={sharedStyle}
      >
        {inner}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="group cursor-pointer transition-all duration-700 ease-out"
      style={sharedStyle}
    >
      {inner}
    </div>
  );
}

export function BlogPageContent({
  posts,
  pageH1,
  introText,
  bodyHtml,
}: {
  posts: PostItem[];
  pageH1: string;
  introText: string;
  bodyHtml?: string | null;
}) {
  return (
    <section className="page-top-offset pb-20 md:pb-28" style={{ backgroundColor: "var(--bg)" }}>
      <div className="container mx-auto max-w-5xl px-5">
        <span
          className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.12em] px-3 py-1.5 rounded-full mb-4 sm:mb-5"
          style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          Блог
        </span>
        <h1
          className="font-heading text-xl sm:text-2xl md:text-[1.75rem] leading-[1.2] tracking-tight mb-5 sm:mb-6 max-w-3xl break-words"
          style={{ color: "var(--text)" }}
        >
          {pageH1}
        </h1>
        <div
          className={`${PAGE_INTRO_PROSE_CLASS} ${bodyHtml ? "mb-8 md:mb-10" : "mb-10 md:mb-14"}`}
          style={{ color: "var(--text-muted)" }}
          dangerouslySetInnerHTML={{ __html: formatArticleBody(introText) }}
        />
        {bodyHtml ? (
          <div
            className={`${PAGE_INTRO_PROSE_CLASS} mb-10 md:mb-14 max-w-none w-full overflow-x-auto`}
            style={{ color: "var(--text-muted)" }}
            dangerouslySetInnerHTML={{ __html: formatArticleBody(bodyHtml) }}
          />
        ) : null}
      </div>

      <div className="container mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
