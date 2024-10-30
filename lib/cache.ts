/**
 * Simple in-memory cache implementation
 * Note: This is for development only. Use Redis in production.
 */

const cache = new Map<string, { value: string; expires: number }>();

const CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds

export async function cacheImage(
  key: string,
  imageUrl: string
): Promise<void> {
  cache.set(key, {
    value: imageUrl,
    expires: Date.now() + CACHE_TTL * 1000
  });
}

export async function getCachedImage(
  key: string
): Promise<string | null> {
  const item = cache.get(key);
  
  if (!item) return null;
  
  if (Date.now() > item.expires) {
    cache.delete(key);
    return null;
  }
  
  return item.value;
} 