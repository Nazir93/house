import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { buildRedirectMap } from "@/lib/seo/redirect-map";

export const dynamic = "force-dynamic";

function internalSecret(): string {
  return (
    process.env.INTERNAL_API_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    ""
  );
}

function isAuthorized(request: NextRequest): boolean {
  const secret = internalSecret();
  if (!secret) return false;
  return request.headers.get("x-internal-secret") === secret;
}

const getCachedRedirectMap = unstable_cache(
  async () => {
    try {
      const rows = await prisma.redirect.findMany({
        select: { fromPath: true, toPath: true, permanent: true },
      });
      return buildRedirectMap(rows);
    } catch {
      return {};
    }
  },
  ["redirect-map"],
  { revalidate: 60, tags: ["redirect-map"] }
);

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const map = await getCachedRedirectMap();
  return NextResponse.json(map, {
    headers: { "Cache-Control": "private, max-age=60" },
  });
}
