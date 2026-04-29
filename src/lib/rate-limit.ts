import { kv } from '@vercel/kv';

const RATE_LIMIT_KEY_PREFIX = 'rate-limit:';
const MAX_REQUESTS = 10;
const WINDOW_SECONDS = 3600;

export async function checkRateLimit(userId: string): Promise<boolean> {
  const key = `${RATE_LIMIT_KEY_PREFIX}${userId}`;
  const currentCount = (await kv.get<number>(key)) || 0;

  if (currentCount >= MAX_REQUESTS) {
    return false;
  }

  await kv.set(key, currentCount + 1, { ex: WINDOW_SECONDS });
  return true;
}