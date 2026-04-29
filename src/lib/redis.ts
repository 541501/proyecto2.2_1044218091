import { kv } from '@vercel/kv';

// Fallback en memoria para desarrollo
const memoryCache = new Map<string, { value: any; expiresAt: number }>();

export async function getCache(key: string): Promise<any | null> {
  try {
    return await kv.get(key);
  } catch {
    const entry = memoryCache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.value;
    }
    return null;
  }
}

export async function setCache(key: string, value: any, ttlSeconds: number): Promise<void> {
  try {
    await kv.set(key, value, { ex: ttlSeconds });
  } catch {
    memoryCache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    await kv.del(key);
  } catch {
    memoryCache.delete(key);
  }
}

export async function invalidarHorarioSalon(salonId: string, fecha: string): Promise<void> {
  const key = `horario:${salonId}:${fecha}`;
  await invalidateCache(key);
}