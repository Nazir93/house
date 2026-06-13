import { readFile, stat } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  contentDispositionAttachment,
  mimeTypeForUploadPath,
  resolveClientUploadFile,
} from "@/lib/client-upload-file";
import { requireAdminApiSession } from "@/lib/require-admin-api";

function parseToken(request: NextRequest): string | null {
  const token = request.nextUrl.searchParams.get("token");
  return token && token.trim() ? token.trim() : null;
}

export async function GET(request: NextRequest) {
  const token = parseToken(request);
  const leadIdParam = request.nextUrl.searchParams.get("leadId");

  let leadId: string | null = null;

  if (leadIdParam?.trim()) {
    const gate = await requireAdminApiSession();
    if (!gate.ok) return gate.response;
    leadId = leadIdParam.trim();
  } else if (token) {
    const t = await prisma.thankYouToken.findUnique({
      where: { token },
      select: { leadId: true, expiresAt: true },
    });
    if (!t?.leadId || t.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    leadId = t.leadId;
  } else {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      proposalStatus: true,
      proposalPath: true,
      proposalFilename: true,
      proposalError: true,
    },
  });
  if (!lead) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (!lead.proposalPath) {
    return NextResponse.json(
      {
        status: lead.proposalStatus,
        error: lead.proposalError,
      },
      { status: 202 }
    );
  }

  const resolved = resolveClientUploadFile(lead.proposalPath);
  if (!resolved) return NextResponse.json({ error: "file_unavailable" }, { status: 404 });

  try {
    const st = await stat(resolved.filePath);
    if (!st.isFile()) return NextResponse.json({ error: "file_unavailable" }, { status: 404 });
    const buffer = await readFile(resolved.filePath);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeTypeForUploadPath(resolved.filePath),
        "Content-Length": String(buffer.length),
        "Content-Disposition": contentDispositionAttachment(lead.proposalFilename || "commercial-proposal.pdf"),
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "file_unavailable" }, { status: 404 });
  }
}

