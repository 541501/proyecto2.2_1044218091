import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/login", "/"];
  const authApiRoutes = /^\/api\/auth\//;

  if (publicRoutes.includes(pathname) || authApiRoutes.test(pathname)) {
    return NextResponse.next();
  }

  // Verificar sesión
  const session = await auth();

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rutas de admin solo para ADMIN y COORDINADOR
  if (pathname.startsWith("/admin")) {
    const userRole = session.user?.rol;
    if (userRole !== "ADMIN" && userRole !== "COORDINADOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
