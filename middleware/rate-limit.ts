import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from '@/lib/rate-limiter';
import logger from '@/lib/logger';

export type NextFunction = (request: NextRequest) => Promise<NextResponse>;

let rateLimiter: RateLimiter | null = null;

function getRateLimiter(): RateLimiter {
  if (!rateLimiter) {
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60', 10);

    rateLimiter = new RateLimiter({
      windowMs,
      maxRequests,
      keyGenerator: (req: Request) => {
        const forwardedFor = req.headers.get('x-forwarded-for');
        const realIP = req.headers.get('x-real-ip');
        return forwardedFor || realIP || 'unknown';
      },
    });

    logger.debug('[Rate Limiter] Initialized', { windowMs, maxRequests });
  }

  return rateLimiter;
}

export async function rateLimitMiddleware(
  request: NextRequest,
  next: NextFunction
): Promise<NextResponse> {
  const isRateLimitingEnabled = process.env.ENABLE_RATE_LIMITING === 'true';

  if (!isRateLimitingEnabled) {
    logger.debug('[Rate Limiter] Disabled, skipping check');
    return next(request);
  }

  try {
    const limiter = getRateLimiter();
    const result = await limiter.checkLimit(request);

    logger.debug('[Rate Limiter] Check result', {
      allowed: result.allowed,
      remaining: result.remaining,
      resetTime: result.resetTime.toISOString(),
    });

    if (!result.allowed) {
      logger.warn('[Rate Limiter] Request blocked', {
        remaining: result.remaining,
        resetTime: result.resetTime.toISOString(),
      });

      const retryAfter = Math.ceil((result.resetTime.getTime() - Date.now()) / 1000);

      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': process.env.RATE_LIMIT_MAX_REQUESTS || '60',
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(result.resetTime.getTime() / 1000).toString(),
            'Retry-After': retryAfter.toString(),
          },
        }
      );
    }

    const response = await next(request);

    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', process.env.RATE_LIMIT_MAX_REQUESTS || '60');
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set(
      'X-RateLimit-Reset',
      Math.ceil(result.resetTime.getTime() / 1000).toString()
    );

    return response;
  } catch (error) {
    logger.error('[Rate Limiter] Error during rate limit check', { error });
    // Continue to next middleware on error to avoid breaking the application
    return next(request);
  }
}
