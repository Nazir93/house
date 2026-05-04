import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
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

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLoginPage = pathname === "/admin/login";
  const isApiAuth = pathname.startsWith("/api/auth");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isAccountRoute = pathname.startsWith("/account");
  const isAccountLoginPage = pathname === "/account/login";
  const isClientApi = pathname.startsWith("/api/client");

  const skipToken =
    !isAdminRoute && !isAdminApi && !isAccountRoute && !isClientApi;
  if (skipToken) return NextResponse.next();
  if (isApiAuth) return NextResponse.next();

  /**
   * Не задаём secureCookie явно: getToken сам берёт признак из NEXTAUTH_URL.startsWith('https://')
   * (как и выдача cookie в NextAuth). Если передать только x-forwarded-proto, без заголовка
   * от nginx приложение будет искать не то имя cookie — вход «не открывает» админку.
   */
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  });

  const role = token?.role as string | undefined;

  if (isAdminRoute && !isAdminLoginPage) {
    if (role === "client") {
      return NextResponse.redirect(new URL("/account/dashboard", request.url));
    }
    if (!token || role !== "admin") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isAdminLoginPage) {
    if (token && role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (token && role === "client") {
      return NextResponse.redirect(new URL("/account/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isAdminApi) {
    if (!token || role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

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
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
