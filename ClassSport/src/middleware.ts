import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { protectRoute } from '@/lib/withAuth';
import { verifyJWT } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/'];
  const publicApiRoutes = ['/api/auth/login', '/api/system/mode'];

  // Permitir rutas públicas
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Permitir API públicas
  if (publicApiRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Para rutas privadas, verificar token
  const token = request.cookies.get('classsport_token')?.value;

  if (!token) {
    // Si no hay token y es una API route privada
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Si es una página, redirigir a login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verificar JWT
  const payload = await verifyJWT(token);

  if (!payload) {
    // Token inválido o expirado
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Rutas de admin solo para admin
  if (pathname.startsWith('/admin')) {
    if (payload.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Rutas de reports solo para coordinador y admin
  if (pathname.startsWith('/reports')) {
    if (payload.role !== 'coordinador' && payload.role !== 'admin') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
