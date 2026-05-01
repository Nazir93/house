import { mergeProjectVideoUrls } from "@/lib/portfolio-data";

/** Нормализация полей видео из тела запроса админки. */
export function normalizedProjectVideos(body: { videoUrls?: unknown; videoUrl?: unknown }) {
  const fromArr = Array.isArray(body.videoUrls)
    ? body.videoUrls.map((u) => String(u).trim()).filter(Boolean)
    : [];
  const single = typeof body.videoUrl === "string" ? body.videoUrl.trim() : "";
  const merged = mergeProjectVideoUrls(fromArr, single || null);
  return { videoUrls: merged, videoUrl: merged[0] ?? null };
}
