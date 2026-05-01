import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const redirects = await prisma.redirect.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(redirects);
  } catch (error) {
    console.error("[ADMIN REDIRECTS]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

function isRelativePath(p: string): boolean {
  if (/^[a-zA-Z]+:\/\//.test(p)) return false;
  if (p.startsWith("//")) return false;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { fromPath, toPath, permanent } = await request.json();
    if (!fromPath || !toPath) {
      return NextResponse.json({ error: "fromPath and toPath required" }, { status: 400 });
    }

    if (!isRelativePath(fromPath) || !isRelativePath(toPath)) {
      return NextResponse.json({ error: "Only relative paths allowed" }, { status: 400 });
    }

    const redirect = await prisma.redirect.create({
      data: {
        fromPath: fromPath.startsWith("/") ? fromPath : `/${fromPath}`,
        toPath: toPath.startsWith("/") ? toPath : `/${toPath}`,
        permanent: permanent ?? true,
      },
    });
    return NextResponse.json(redirect, { status: 201 });
  } catch (error) {
    console.error("[ADMIN REDIRECT CREATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
