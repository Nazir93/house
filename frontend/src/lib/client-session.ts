import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Сервер: id объекта для текущей клиентской сессии или null */
export async function getClientProjectIdFromSession(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "client" || !session.user.clientProjectId) return null;
  return session.user.clientProjectId;
}
