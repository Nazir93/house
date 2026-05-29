"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEngagementCount } from "@/lib/house-project-engagement";

type Props = {
  slug: string;
  initialViewCount: number;
  initialLikeCount: number;
  className?: string;
  /** На странице проекта — +1 просмотр при первом заходе */
  recordView?: boolean;
};

export function ProjectEngagementBadges({
  slug,
  initialViewCount,
  initialLikeCount,
  className,
  recordView = false,
}: Props) {
  const [viewCount, setViewCount] = useState(initialViewCount);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  useEffect(() => {
    setViewCount(initialViewCount);
    setLikeCount(initialLikeCount);
  }, [initialViewCount, initialLikeCount]);

  useEffect(() => {
    void fetch(`/api/projects/${encodeURIComponent(slug)}/engagement`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || typeof data !== "object") return;
        if (typeof data.viewCount === "number") setViewCount(data.viewCount);
        if (typeof data.likeCount === "number") setLikeCount(data.likeCount);
        if (typeof data.liked === "boolean") setLiked(data.liked);
      })
      .catch(() => {});
  }, [slug]);

  const syncFromServer = useCallback(async (action: "view" | "like", likedNext?: boolean) => {
    const res = await fetch(`/api/projects/${encodeURIComponent(slug)}/engagement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(
        action === "like" ? { action: "like", liked: likedNext } : { action: "view" },
      ),
    });
    if (!res.ok) return;
    const data = (await res.json()) as {
      viewCount?: number;
      likeCount?: number;
      liked?: boolean;
    };
    if (typeof data.viewCount === "number") setViewCount(data.viewCount);
    if (typeof data.likeCount === "number") setLikeCount(data.likeCount);
    if (typeof data.liked === "boolean") setLiked(data.liked);
  }, [slug]);

  useEffect(() => {
    if (!recordView) return;
    void syncFromServer("view");
  }, [recordView, syncFromServer]);

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (likeBusy) return;

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((n) => Math.max(0, n + (nextLiked ? 1 : -1)));
    setLikeBusy(true);
    try {
      await syncFromServer("like", nextLiked);
    } catch {
      setLiked(!nextLiked);
      setLikeCount((n) => Math.max(0, n + (nextLiked ? -1 : 1)));
    } finally {
      setLikeBusy(false);
    }
  };

  return (
    <div className={cn("flex justify-end gap-2", className)}>
      <span
        className="inline-flex items-center gap-1 rounded-full bg-black/48 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm tabular-nums"
        title="Просмотры"
      >
        <Eye className="h-3 w-3 opacity-95" aria-hidden />
        {formatEngagementCount(viewCount)}
      </span>
      <button
        type="button"
        onClick={toggleLike}
        disabled={likeBusy}
        aria-pressed={liked}
        aria-label={liked ? "Убрать отметку «огонёк»" : "Отметить проект «огоньком»"}
        title={liked ? "Вы отметили проект" : "Отметить проект"}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm transition tabular-nums",
          liked
            ? "bg-[color-mix(in_srgb,#e85d04_88%,black)] text-white ring-1 ring-white/30"
            : "bg-black/48 text-white hover:bg-black/60",
          likeBusy && "opacity-70",
        )}
      >
        <Flame
          className={cn("h-3 w-3", liked ? "opacity-100 fill-white/25" : "opacity-95")}
          aria-hidden
        />
        {formatEngagementCount(likeCount)}
      </button>
    </div>
  );
}
