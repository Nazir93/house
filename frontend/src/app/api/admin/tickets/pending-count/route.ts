import { NextResponse } from "next/server";
import { requireAdminApiSession } from "@/lib/require-admin-api";
import { countTicketsNeedingStaffReplyDb } from "@/lib/admin-ticket-inbox";
import { withApiRouteLog } from "@/lib/api-route-log";

export const dynamic = "force-dynamic";

/** Тикеты, где последнее сообщение от клиента и ещё не просмотрено сотрудником. */
export async function GET() {
  return withApiRouteLog("GET", "/api/admin/tickets/pending-count", async () => {
    const gate = await requireAdminApiSession();
    if (!gate.ok) return gate.response;

    try {
      const count = await countTicketsNeedingStaffReplyDb();
      return NextResponse.json({ count });
    } catch (e) {
      console.error("[ADMIN TICKETS PENDING COUNT]", e);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }
  });
}
