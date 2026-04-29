/**
 * Cliente Redis con @vercel/kv
 * Fallback a Map en memoria para desarrollo
 */

import { kv } from "@vercel/kv";

// Fallback en memoria para desarrollo
const memoryCache = new Map<string, { value: any; expiresAt: number }>();

/**
 * Interfaz para operaciones de caché
 */
interface CacheClient {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  del(...keys: string[]): Promise<void>;
  exists(...keys: string[]): Promise<number>;
}

/**
 * Implementación con @vercel/kv (Redis)
 */
class RedisClient implements CacheClient {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await kv.get<T>(key);
      return value || null;
    } catch (error) {
      console.error(`[Redis] Error getting key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    try {
      await kv.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      console.error(`[Redis] Error setting key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void>;
  async del(...keys: string[]): Promise<void>;
  async del(...keys: string[]): Promise<void> {
    try {
      if (keys.length > 0) {
        await kv.del(...keys);
      }
    } catch (error) {
      console.error(`[Redis] Error deleting keys:`, error);
    }
  }

  async exists(...keys: string[]): Promise<number> {
    try {
      const result = await kv.exists(...keys);
      return result || 0;
    } catch (error) {
      console.error(`[Redis] Error checking existence:`, error);
      return 0;
    }
  }
}

/**
 * Implementación con Map en memoria (fallback dev)
 */
class MemoryCacheClient implements CacheClient {
  async get<T>(key: string): Promise<T | null> {
    const cached = memoryCache.get(key);

    if (!cached) {
      return null;
    }

    // Verificar expiración
    if (cached.expiresAt < Date.now()) {
      memoryCache.delete(key);
      return null;
    }

    return cached.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    memoryCache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void>;
  async del(...keys: string[]): Promise<void>;
  async del(...keys: string[]): Promise<void> {
    keys.forEach((k) => memoryCache.delete(k));
  }

  async exists(...keys: string[]): Promise<number> {
    return keys.filter((k) => {
      const cached = memoryCache.get(k);
      if (!cached) return false;
      if (cached.expiresAt < Date.now()) {
        memoryCache.delete(k);
        return false;
      }
      return true;
    }).length;
  }
}

/**
 * Selecciona cliente según entorno
 */
function getClient(): CacheClient {
  // Usar Redis en producción/vercel, memoria en desarrollo
  if (process.env.KV_URL) {
    console.log("[Cache] Using Redis client");
    return new RedisClient();
  } else {
    console.log("[Cache] Using in-memory cache (fallback)");
    return new MemoryCacheClient();
  }
}

const client = getClient();

/**
 * Obtiene valor del caché
 */
export async function getCache<T>(key: string): Promise<T | null> {
  return client.get<T>(key);
}

/**
 * Guarda valor en caché con TTL
 */
export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = 3600
): Promise<void> {
  return client.set(key, value, ttlSeconds);
}

/**
 * Elimina una o más claves del caché
 */
export async function invalidateCache(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  return client.del(...keys);
}

/**
 * Invalida todas las claves relacionadas a un salón
 */
export async function invalidateSalonCache(
  salonId: string,
  fecha?: string | Date
): Promise<void> {
  const keysToDelete: string[] = [];

  // Invalidar clave de disponibilidad específica
  if (fecha) {
    const dateStr = fecha instanceof Date ? fecha.toISOString().split("T")[0] : fecha;
    keysToDelete.push(`horario:${salonId}:${dateStr}`);
  }

  // Invalidar todas las claves del salón (patron: horario:salonId:*)
  keysToDelete.push(`horario:${salonId}:all`);

  if (keysToDelete.length > 0) {
    await invalidateCache(...keysToDelete);
  }
}

/**
 * Obtiene clave de caché formateada
 */
export function getCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return [prefix, ...parts.filter(Boolean)].join(":");
}

/**
 * Limpia el caché completo (CUIDADO: solo en desarrollo)
 */
export async function clearAllCache(): Promise<void> {
  if (process.env.NODE_ENV !== "development") {
    console.warn("[Cache] clearAllCache() only available in development");
    return;
  }

  // En memoria es simple
  if (client instanceof MemoryCacheClient) {
    memoryCache.clear();
  }
  // Nota: Redis no tiene clear directo, se omite en producción
}

/**
 * Invalida el horario del salón para una fecha específica
 */
export async function invalidarHorarioSalon(salonId: string, fecha: string): Promise<void> {
  await invalidateSalonCache(salonId, fecha);
}
