// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const REFRESH_API_PATH = "/api/TokenManager/refreshTokens";
const REFRESH_API_KEY = process.env.REFRESH_API_KEY;
const PUBLIC_API_PATHS = ["/api/auth"];
const ADMIN_API_PATHS = ["/api/admin"];
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const baseUrl = process.env.BASE_URL;
if (!baseUrl) {
  throw new Error("Missing BASE_URL environment variable error in middleware!");
}

const isPublicApi = (pathname: string) =>
  PUBLIC_API_PATHS.some((publicPath) => pathname.startsWith(publicPath));

const isAdminApi = (pathname: string) =>
  ADMIN_API_PATHS.some((adminPath) => pathname.startsWith(adminPath));

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const adminToken = req.cookies.get("admin_token")?.value;

  const adminDashboard = req.nextUrl.clone();
  adminDashboard.pathname = "/admin/dashboard";

  if (pathname === "/admin/login" && adminToken) {
    try {
      const { payload } = await jwtVerify(adminToken, SECRET);
      if (payload?.admin) return NextResponse.redirect(adminDashboard);
    } catch {}
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";

    if (!adminToken) return NextResponse.redirect(url);

    try {
      const { payload } = await jwtVerify(adminToken, SECRET);
      if (!payload.admin) throw new Error("Not an admin");
    } catch {
      return NextResponse.redirect(url);
    }
  }

  const token = req.cookies.get("accessToken")?.value;

  if (pathname === REFRESH_API_PATH) {
    const apiKeyFromQuery = req.nextUrl.searchParams.get("key");
    const apiKeyFromHeader = req.headers.get("x-api-key");

    if (
      apiKeyFromQuery !== REFRESH_API_KEY &&
      apiKeyFromHeader !== REFRESH_API_KEY
    ) {
      return new Response("Unauthorized", { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname === "/auth" && token) {
    try {
      await jwtVerify(token, SECRET);
      const url = req.nextUrl.clone();
      url.pathname = "/study";
      return NextResponse.redirect(url);
    } catch {
      return redirectWithCookieClear(req);
    }
  }

  const isApi = pathname.startsWith("/api/");
  const isProtectedApi = isApi && !(isPublicApi(pathname) || isAdminApi(pathname));
  const isStudyPage = pathname.startsWith("/study");
  const isWatchPage = pathname.startsWith("/watch");

  if (isProtectedApi || isStudyPage || isWatchPage) {
    if (!token) {
      return redirectWithCookieClear(req);
    }

    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch (err: any) {
      console.warn("JWT invalid or expired:", err);
      return redirectWithCookieClear(req);
    }
  }

  return NextResponse.next();
}

function redirectWithCookieClear(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/auth", req.url));
  res.cookies.set("accessToken", "", { path: "/", expires: new Date(0) });
  res.cookies.set("refreshToken", "", { path: "/", expires: new Date(0) });
  return res;
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|.*\\..*).*)",
  ],
};
