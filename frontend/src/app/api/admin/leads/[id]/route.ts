import { NextRequest, NextResponse } from "next/server";
import type { LeadStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { parseLeadEditableStatus } from "@/lib/lead-admin-ui";
import { requireAdminApiSession } from "@/lib/require-admin-api";

export async function GET(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const lead = await prisma.lead.findUnique({ where: { id: params.id } });
    if (!lead) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(lead);
  } catch (error) {
    console.error("[ADMIN LEAD]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    const body = await request.json();
    const { status, notes } = body;

    const data: Prisma.LeadUpdateInput = {};
    if (status !== undefined) {
      const parsed = parseLeadEditableStatus(status);
      if (!parsed) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      data.status = parsed as LeadStatus;
    }
    if (notes !== undefined) data.notes = notes;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error("[ADMIN LEAD UPDATE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAdminApiSession();
  if (!gate.ok) return gate.response;

  try {
    await prisma.lead.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN LEAD DELETE]", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
