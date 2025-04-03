import { Redis } from "ioredis";

const MAX_ERRORS = 5;
const RETRY_DELAY_MS = 5000;
let errorCount = 0;
let isAvailable = true;

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 20,
  retryStrategy: (times) => {
    return Math.min(times * 100, RETRY_DELAY_MS);
  },
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
  errorCount++;
  if (errorCount >= MAX_ERRORS) {
    isAvailable = false;
    setTimeout(() => {
      isAvailable = true;
      errorCount = 0;
    }, RETRY_DELAY_MS);
  }
});

redis.on("connect", () => {
  isAvailable = true;
  errorCount = 0;
});

/**
 * Checks if Redis is currently available
 */
export function isRedisAvailable() {
  return isAvailable;
}

/**
 * Generates a unique Redis key based on userId and baseKey
 */
export function getKey(
  userId: string | null | undefined,
  baseKey: string
): string {
  return userId ? `${userId}_${baseKey}` : baseKey;
}

// Export the redis client for direct use
export default redis;
