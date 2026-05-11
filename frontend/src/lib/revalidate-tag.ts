import { revalidateTag as nextRevalidateTag } from "next/cache";

/**
 * Cross-version `revalidateTag`: Next 16+ expects a cache profile; older Next typings
 * only declare `tag`. Runtime ignores extra args on older Next; Next 16 uses the profile.
 */
export function revalidateTagWithProfile(tag: string, profile = "default"): void {
  (nextRevalidateTag as (t: string, p?: string) => void)(tag, profile);
}
