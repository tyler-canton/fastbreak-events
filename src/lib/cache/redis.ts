import { Redis } from '@upstash/redis'

// Create Redis client - will be null if env vars not set
function createRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    // Redis not configured - silently fallback to direct DB queries
    return null
  }

  return new Redis({ url, token })
}

export const redis = createRedisClient()

// Cache TTL in seconds
export const CACHE_TTL = {
  EVENTS: 300,      // 5 minutes
  SERIES: 600,      // 10 minutes
  EVENT_DETAIL: 300, // 5 minutes
}

// Cache key generators
export const cacheKeys = {
  events: (userId: string, filters?: string) =>
    `events:${userId}${filters ? `:${filters}` : ''}`,
  series: (userId: string) =>
    `series:${userId}`,
  event: (eventId: string) =>
    `event:${eventId}`,
}

// Generic cache wrapper
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<{ data: T; fromCache: boolean }> {
  // If Redis not configured, just fetch
  if (!redis) {
    const data = await fetcher()
    return { data, fromCache: false }
  }

  try {
    // Try to get from cache
    const cached = await redis.get<T>(key)
    if (cached !== null) {
      console.log(`[Cache HIT] ${key}`)
      return { data: cached, fromCache: true }
    }

    // Cache miss - fetch and store
    console.log(`[Cache MISS] ${key}`)
    const data = await fetcher()
    await redis.set(key, data, { ex: ttl })
    return { data, fromCache: false }
  } catch (error) {
    console.error('[Cache Error]', error)
    // On error, just fetch directly
    const data = await fetcher()
    return { data, fromCache: false }
  }
}

// Invalidate cache patterns
export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis) return

  try {
    // For simple patterns, delete the exact key
    // Note: Upstash doesn't support KEYS command, so we delete known keys
    await redis.del(pattern)
    console.log(`[Cache INVALIDATE] ${pattern}`)
  } catch (error) {
    console.error('[Cache Invalidate Error]', error)
  }
}

// Invalidate all user's event caches
export async function invalidateUserEventCache(userId: string): Promise<void> {
  if (!redis) return

  try {
    // Delete the main events cache for this user
    await redis.del(cacheKeys.events(userId))
    console.log(`[Cache INVALIDATE] User events: ${userId}`)
  } catch (error) {
    console.error('[Cache Invalidate Error]', error)
  }
}

// Invalidate all user's series caches
export async function invalidateUserSeriesCache(userId: string): Promise<void> {
  if (!redis) return

  try {
    await redis.del(cacheKeys.series(userId))
    console.log(`[Cache INVALIDATE] User series: ${userId}`)
  } catch (error) {
    console.error('[Cache Invalidate Error]', error)
  }
}
