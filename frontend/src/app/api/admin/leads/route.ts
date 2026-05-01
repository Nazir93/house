import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const sourceParam = searchParams.get("source");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const and: Prisma.LeadWhereInput[] = [];

  if (status && status !== "ALL") {
    and.push({ status: status as "NEW" | "IN_PROGRESS" | "DONE" | "CANCELLED" });
  }

  if (sourceParam) {
    and.push({ source: sourceParam });
  }

  if (search) {
    and.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.LeadWhereInput = and.length > 0 ? { AND: and } : {};

  try {
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      leads,
      total,
      pages: Math.ceil(total / limit),
      page,
    });
  } catch (error) {
    console.error("[ADMIN LEADS]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
