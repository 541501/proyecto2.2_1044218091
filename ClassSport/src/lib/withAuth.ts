/**
 * lib/withAuth.ts — Middleware para proteger rutas con autenticación
 *
 * CRÍTICO:
 * - Agrega headers no-store para desactivar caché
 * - Verifica JWT y redirige a /login si no existe
 * - Inyecta contexto de usuario en la solicitud
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from './auth';
import { AuthContext, JWTPayload } from './types';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET?: string;
    }
  }
}

export async function withAuth(
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    // Headers no-store — CRÍTICO para no cachear
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    // Obtener token de la cookie
    const token = req.cookies.get('classsport_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
    }

    // Verificar JWT
    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401, headers });
    }

    // Llamar al handler con contexto de autenticación
    const context: AuthContext = {
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        name: '', // Se llenará desde la BD
        is_active: true,
        must_change_password: false,
      },
      token,
    };

    const response = await handler(req, context);

    // Agregar headers no-store a la respuesta
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  };
}

/**
 * Wrapper simple para middleware de protección de rutas en Next.js middleware.ts
 */
export async function protectRoute(req: NextRequest, token: string | null): Promise<JWTPayload | null> {
  if (!token) {
    return null;
  }
  return verifyJWT(token);
}
