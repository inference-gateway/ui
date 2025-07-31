export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
}

export interface RateLimiterConfig {
  windowMs?: number; // Time window in milliseconds
  maxRequests?: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Function to generate unique keys
}

export class RateLimitError extends Error {
  public name = 'RateLimitError';

  constructor(
    message: string,
    public resetTime: Date,
    public remaining: number
  ) {
    super(message);
  }
}

export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private keyGenerator: (req: Request) => string;
  private store: Map<string, { count: number; resetTime: Date }> = new Map();

  constructor(config: RateLimiterConfig = {}) {
    this.windowMs = config.windowMs ?? 60000; // Default: 1 minute
    this.maxRequests = config.maxRequests ?? 60; // Default: 60 requests per minute
    this.keyGenerator = config.keyGenerator ?? this.defaultKeyGenerator;
  }

  private defaultKeyGenerator(req: Request): string {
    // Try to get real IP from headers
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    return forwardedFor || realIP || 'unknown';
  }

  async checkLimit(req: Request): Promise<RateLimitResult> {
    const key = this.keyGenerator(req);
    const now = new Date();
    const entry = this.store.get(key);

    // Clean up expired entries periodically
    this.cleanup();

    if (!entry || now.getTime() >= entry.resetTime.getTime()) {
      // First request or window expired, create new entry
      const resetTime = new Date(now.getTime() + this.windowMs);
      this.store.set(key, { count: 1, resetTime });

      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime,
      };
    }

    if (entry.count >= this.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment counter
    entry.count++;

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  private cleanup(): void {
    const now = new Date();
    for (const [key, entry] of this.store.entries()) {
      if (now.getTime() >= entry.resetTime.getTime()) {
        this.store.delete(key);
      }
    }
  }
}
