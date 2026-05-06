import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/** Route handlers выполняются в Node — надёжнее, чем getToken в Edge middleware. */
export async function requireAdminApiSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true as const, session };
}
