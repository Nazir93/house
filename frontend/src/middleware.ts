import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Редирект HTTP→HTTPS только за reverse proxy (nginx и т.д.).
  // Прямой доступ к Node на :3000 без X-Forwarded-* не трогаем — иначе Location может стать https://0.0.0.0:3000/.
  if (process.env.NODE_ENV === "production") {
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

  /** Наследие электромонтажа / старой воронки — уводим на актуальные разделы */
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
  const isLoginPage = pathname === "/admin/login";
  const isApiAuth = pathname.startsWith("/api/auth");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminRoute && !isAdminApi) return NextResponse.next();
  if (isApiAuth) return NextResponse.next();

  // Должно совпадать с именем cookie (__Secure-…), которое выставляет NextAuth при HTTPS
  const isHttps =
    request.headers.get("x-forwarded-proto") === "https" ||
    request.nextUrl.protocol === "https:";

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: isHttps,
  });

  if (isAdminRoute && !isLoginPage && !token) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (isAdminApi && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
      Редирект HTTP→HTTPS для всего сайта; защита админки — только для /admin и /api/admin
    */
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
