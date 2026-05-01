import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const faqs = await prisma.faq.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json(faqs);
  } catch (error) {
    console.error("[ADMIN FAQ]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const faq = await prisma.faq.create({
      data: {
        question: body.question,
        answer: body.answer,
        service: body.service || null,
        visible: body.visible ?? true,
        order: body.order ?? 0,
      },
    });
    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error("[ADMIN FAQ CREATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
