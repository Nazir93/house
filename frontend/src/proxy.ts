import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { lookupRedirect, type RedirectMap } from "@/lib/seo/redirect-map";

const REDIRECT_MAP_TTL_MS = 60_000;
let redirectMapCache: RedirectMap | null = null;
let redirectMapLoadedAt = 0;

function internalSecret(): string {
  return (
    process.env.INTERNAL_API_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    ""
  );
}

async function loadRedirectMap(origin: string): Promise<RedirectMap> {
  const now = Date.now();
  if (redirectMapCache && now - redirectMapLoadedAt < REDIRECT_MAP_TTL_MS) {
    return redirectMapCache;
  }

  const secret = internalSecret();
  if (!secret) return {};

  try {
    const res = await fetch(`${origin}/api/internal/redirect-map`, {
      headers: { "x-internal-secret": secret },
      cache: "no-store",
    });
    if (!res.ok) return redirectMapCache ?? {};
    const map = (await res.json()) as RedirectMap;
    redirectMapCache = map;
    redirectMapLoadedAt = now;
    return map;
  } catch {
    return redirectMapCache ?? {};
  }
}

/**
 * Имя session-cookie в NextAuth зависит от secure: для HTTPS это `__Secure-next-auth.*`.
 * Выдача сессии берёт origin из запроса (за nginx с TLS это https), а getToken по умолчанию
 * смотрит только на NEXTAUTH_URL — при http:// в env ищется не тот cookie → вход «обновляет» страницу.
 */
function forwardedProtoHttps(req: NextRequest): boolean | null {
  const raw = req.headers.get("x-forwarded-proto");
  if (!raw) return null;
  const first = raw.split(",")[0]?.trim().toLowerCase();
  if (first === "https") return true;
  if (first === "http") return false;
  return null;
}

function resolveSecureCookie(req: NextRequest): boolean {
  const fromFwd = forwardedProtoHttps(req);
  if (fromFwd !== null) return fromFwd;
  return (process.env.NEXTAUTH_URL ?? "").startsWith("https://");
}

/**
 * Секрет для Edge proxy: читаем через Reflect/get по строкам ключей — так надёжнее для runtime
 * (PM2 / `.env` при `next start`), чем статический `process.env.NEXTAUTH_SECRET` в некоторых сборках.
 */
function getEdgeAuthSecret(): string | undefined {
  const env = process.env;
  for (const key of ["NEXTAUTH_SECRET", "AUTH_SECRET"] as const) {
    const v = Reflect.get(env, key);
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

/** Сначала по ожидаемому флагу secure, затем с противоположным — смесь nginx / NEXTAUTH_URL не теряет сессию. */
async function getJwt(req: NextRequest) {
  const secret = getEdgeAuthSecret();
  const primary = resolveSecureCookie(req);
  let token = await getToken({ req, secret, secureCookie: primary });
  if (!token) {
    token = await getToken({ req, secret, secureCookie: !primary });
  }
  return token;
}

export async function proxy(request: NextRequest) {
  // Редирект HTTP→HTTPS из Node по умолчанию ВЫКЛЮЧЕН: у многих VPS на :3000 всё равно пробрасывают
  // X-Forwarded-* → получался битый Location (например https://0.0.0.0:3000/). На проде редирект на HTTPS
  // делайте в nginx. Явно включить: MIDDLEWARE_HTTPS_REDIRECT=true в .env (и корректные proxy-заголовки).
  if (
    process.env.NODE_ENV === "production" &&
    process.env.MIDDLEWARE_HTTPS_REDIRECT === "true"
  ) {
    const proto = request.headers.get("x-forwarded-proto");
    const behindProxy =
      Boolean(request.headers.get("x-forwarded-for")) ||
      Boolean(request.headers.get("x-real-ip"));
    if (proto === "http" && behindProxy) {
      const url = request.nextUrl.clone();
      url.protocol = "https:";
      return NextResponse.redirect(url, 301);
    }
  }

  const { pathname } = request.nextUrl;

  /** Редиректы из админки SEO → таблица Redirect (не для /api — иначе fetch redirect-map в middleware зависает) */
  if (!pathname.startsWith("/api/")) {
    const dbRedirect = lookupRedirect(await loadRedirectMap(request.nextUrl.origin), pathname);
    if (dbRedirect) {
      const url = request.nextUrl.clone();
      url.pathname = dbRedirect.toPath;
      url.search = "";
      return NextResponse.redirect(url, dbRedirect.permanent ? 308 : 307);
    }
  }

  /** Устаревшие URL старого сайта — редирект на актуальные разделы */
  if (pathname === "/offer" || pathname.startsWith("/offer/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/contacts";
    url.search = "";
    return NextResponse.redirect(url, 308);
  }
  if (pathname === "/price" || pathname.startsWith("/price/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/contacts";
    url.search = "";
    return NextResponse.redirect(url, 308);
  }
  if (pathname === "/forum" || pathname.startsWith("/forum/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/contacts";
    url.search = "";
    return NextResponse.redirect(url, 308);
  }
  if (pathname === "/projects/compare" || pathname.startsWith("/projects/compare/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/projects";
    url.search = "";
    return NextResponse.redirect(url, 308);
  }
  /** Устаревшие URL услуг с прежнего шаблона (коммерческий сайт) — на общий список услуг */
  const legacyService = pathname.match(/^\/services\/([^/]+)$/);
  if (legacyService) {
    const slug = legacyService[1];
    const legacy = new Set([
      "electrical",
      "acoustics",
      "structured-cabling",
      "smart-home",
      "security",
      "architectural-lighting",
    ]);
    if (legacy.has(slug)) {
      const url = request.nextUrl.clone();
      url.pathname = "/services";
      url.search = "";
      return NextResponse.redirect(url, 308);
    }
  }

  /**
   * HTML-страницы /admin не проверяем через getToken в Edge (часто ломается расшифровка JWT).
   * Доступ контролирует серверный app/admin/layout.tsx через getServerSession (Node).
   */
  if (pathname.startsWith("/admin")) {
    const h = new Headers(request.headers);
    h.set("x-url-pathname", pathname);
    return NextResponse.next({ request: { headers: h } });
  }

  const isApiAuth = pathname.startsWith("/api/auth");
  const isAccountRoute = pathname.startsWith("/account");
  const isAccountLoginPage = pathname === "/account/login";
  const isClientApi = pathname.startsWith("/api/client");

  /** /api/admin — авторизация в самих route handlers (Node + getServerSession), см. require-admin-api.ts */
  const skipToken = !isAccountRoute && !isClientApi;
  if (skipToken) return NextResponse.next();
  if (isApiAuth) return NextResponse.next();

  const token = await getJwt(request);

  const role = token?.role as string | undefined;

  if (isAccountLoginPage) {
    if (token && role === "client") {
      return NextResponse.redirect(new URL("/account/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isAccountRoute) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (!token || role !== "client") {
      const loginUrl = new URL("/account/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isClientApi) {
    if (!token || role !== "client") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|manifest.webmanifest|serwist|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
