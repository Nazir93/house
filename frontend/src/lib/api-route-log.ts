import { logApiRequest } from "@/lib/ops-alert";

/** Обёртка для route handlers: `[API] METHOD path status ms` в PM2-лог. */
export async function withApiRouteLog(
  method: string,
  path: string,
  handler: () => Promise<Response>
): Promise<Response> {
  const started = Date.now();
  try {
    const response = await handler();
    logApiRequest(method, path, response.status, Date.now() - started);
    return response;
  } catch (error) {
    logApiRequest(method, path, 500, Date.now() - started);
    throw error;
  }
}
