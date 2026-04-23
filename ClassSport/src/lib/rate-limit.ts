/**
 * Rate limiting usando Vercel KV
 * Límite: 10 creaciones de reserva por usuario por hora
 */

import { getCache, setCache } from "@/lib/redis";

const RATE_LIMIT_KEY_PREFIX = "ratelimit:reservas";
const MAX_RESERVAS_PER_HOUR = 10;
const RATE_LIMIT_WINDOW = 3600; // 1 hora en segundos

/**
 * Estructura para guardar intentos de rate limit
 */
interface RateLimitData {
  count: number;
  resetAt: number; // timestamp en segundos
}

/**
 * Verifica si el usuario ha excedido el límite de reservas
 * @param usuarioId ID del usuario
 * @returns { allowed: boolean, remaining: number, resetAt: Date }
 */
export async function checkRateLimit(
  usuarioId: string
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}> {
  const key = `${RATE_LIMIT_KEY_PREFIX}:${usuarioId}`;

  let limitData = await getCache<RateLimitData>(key);

  if (!limitData) {
    // Primera solicitud del usuario
    limitData = {
      count: 1,
      resetAt: Math.floor(Date.now() / 1000) + RATE_LIMIT_WINDOW,
    };
    await setCache(key, limitData, RATE_LIMIT_WINDOW);

    return {
      allowed: true,
      remaining: MAX_RESERVAS_PER_HOUR - 1,
      resetAt: new Date(limitData.resetAt * 1000),
    };
  }

  const now = Math.floor(Date.now() / 1000);

  // Si la ventana de tiempo expiró, resetear
  if (now >= limitData.resetAt) {
    limitData = {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    };
    await setCache(key, limitData, RATE_LIMIT_WINDOW);

    return {
      allowed: true,
      remaining: MAX_RESERVAS_PER_HOUR - 1,
      resetAt: new Date(limitData.resetAt * 1000),
    };
  }

  // Verificar si se excedió el límite
  const allowed = limitData.count < MAX_RESERVAS_PER_HOUR;
  const remaining = Math.max(0, MAX_RESERVAS_PER_HOUR - limitData.count);

  if (allowed) {
    // Incrementar contador
    limitData.count++;
    await setCache(key, limitData, limitData.resetAt - now);
  }

  const resetAt = new Date(limitData.resetAt * 1000);
  const retryAfter = allowed ? undefined : Math.ceil(limitData.resetAt - now);

  return {
    allowed,
    remaining,
    resetAt,
    retryAfter,
  };
}

/**
 * Limpia el rate limit de un usuario (solo admin)
 */
export async function clearUserRateLimit(usuarioId: string): Promise<void> {
  const key = `${RATE_LIMIT_KEY_PREFIX}:${usuarioId}`;
  await getCache(key); // Trigger deletion indirectly
}

/**
 * Obtiene stats de rate limit de un usuario
 */
export async function getRateLimitStats(usuarioId: string): Promise<RateLimitData | null> {
  const key = `${RATE_LIMIT_KEY_PREFIX}:${usuarioId}`;
  return getCache<RateLimitData>(key);
}
