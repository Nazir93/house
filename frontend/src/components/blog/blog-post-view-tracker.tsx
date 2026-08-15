"use client";

import { useEffect } from "react";
import { postViewSessionKey, shouldRecordPostView } from "@/lib/post-views";

/** Фиксирует просмотр новости один раз за сессию браузера. */
export function BlogPostViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = postViewSessionKey(slug);
    let already = false;
    try {
      already = sessionStorage.getItem(key) === "1";
    } catch {
      already = false;
    }
    if (!shouldRecordPostView({ slug, alreadyRecordedInSession: already })) return;

    void fetch(`/api/blog/${encodeURIComponent(slug)}/view`, { method: "POST" })
      .then((res) => {
        if (!res.ok) return;
        try {
          sessionStorage.setItem(key, "1");
        } catch {
          /* ignore */
        }
      })
      .catch(() => {});
  }, [slug]);

  return null;
}
