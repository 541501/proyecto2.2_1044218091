/**
 * lib/auth.ts — Funciones de autenticación y JWT
 *
 * CRÍTICO:
 * - JWT con cookie HttpOnly, Secure, SameSite=Strict
 * - Nunca localStorage
 * - Tokens de 24 horas
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { JWTPayload, SafeUser } from './types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'change-me-in-production-12345'
);

const COOKIE_NAME = 'classsport_token';
const TOKEN_EXPIRY = 24 * 60 * 60; // 24 horas en segundos

/**
 * Crea un JWT para un usuario
 */
export async function createJWT(user: SafeUser): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + TOKEN_EXPIRY;

  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
  } as Omit<JWTPayload, 'iat' | 'exp'>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verifica y decodifica un JWT
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Establece la cookie de sesión (HttpOnly, Secure, SameSite=Strict)
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: TOKEN_EXPIRY,
    path: '/',
  });
}

/**
 * Obtiene el token de la cookie
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value || null;
}

/**
 * Limpia la cookie de sesión (logout)
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Obtiene el usuario actual desde la cookie
 */
export async function getCurrentSession(): Promise<JWTPayload | null> {
  const token = await getSessionToken();
  if (!token) {
    return null;
  }
  return verifyJWT(token);
}
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.usuario.findUnique({
          where: { email: user.email! },
        });
        token.id = dbUser?.id;
        token.rol = dbUser?.rol;
        token.nombre = dbUser?.nombre;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.rol = token.rol as string;
        session.user.nombre = token.nombre as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { auth, signIn, signOut, handlers } = NextAuth(authOptions);
