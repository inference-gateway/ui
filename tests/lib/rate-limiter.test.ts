/**
 * @jest-environment node
 */
import { RateLimiter, RateLimitError } from '@/lib/rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      windowMs: 60000, // 1 minute
      maxRequests: 5,
      keyGenerator: req => req.headers.get('x-forwarded-for') || 'default',
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should create a rate limiter with default configuration', () => {
      const defaultLimiter = new RateLimiter();
      expect(defaultLimiter).toBeInstanceOf(RateLimiter);
    });

    it('should create a rate limiter with custom configuration', () => {
      const customLimiter = new RateLimiter({
        windowMs: 30000,
        maxRequests: 10,
      });
      expect(customLimiter).toBeInstanceOf(RateLimiter);
    });
  });

  describe('checkLimit', () => {
    it('should allow requests within the limit', async () => {
      const mockRequest = new Request('http://localhost:3000/api/test');

      // First request should be allowed
      const result1 = await rateLimiter.checkLimit(mockRequest);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(4);
      expect(result1.resetTime).toBeInstanceOf(Date);

      // Second request should be allowed
      const result2 = await rateLimiter.checkLimit(mockRequest);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should block requests exceeding the limit', async () => {
      const mockRequest = new Request('http://localhost:3000/api/test');

      // Use up all allowed requests
      for (let i = 0; i < 5; i++) {
        const result = await rateLimiter.checkLimit(mockRequest);
        expect(result.allowed).toBe(true);
      }

      // Next request should be blocked
      const blockedResult = await rateLimiter.checkLimit(mockRequest);
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.remaining).toBe(0);
    });

    it('should reset counter after window expires', async () => {
      jest.useFakeTimers();
      const mockRequest = new Request('http://localhost:3000/api/test');

      // Use up all allowed requests
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkLimit(mockRequest);
      }

      // Should be blocked
      const blockedResult = await rateLimiter.checkLimit(mockRequest);
      expect(blockedResult.allowed).toBe(false);

      // Fast forward past the window
      jest.advanceTimersByTime(60001);

      // Should be allowed again
      const allowedResult = await rateLimiter.checkLimit(mockRequest);
      expect(allowedResult.allowed).toBe(true);
      expect(allowedResult.remaining).toBe(4);
    });

    it('should use different keys for different IPs', async () => {
      const mockRequest1 = new Request('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });
      const mockRequest2 = new Request('http://localhost:3000/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.2' },
      });

      // Use up all requests for first IP
      for (let i = 0; i < 5; i++) {
        const result = await rateLimiter.checkLimit(mockRequest1);
        expect(result.allowed).toBe(true);
      }

      // First IP should be blocked
      const blocked = await rateLimiter.checkLimit(mockRequest1);
      expect(blocked.allowed).toBe(false);

      // Second IP should still be allowed
      const allowed = await rateLimiter.checkLimit(mockRequest2);
      expect(allowed.allowed).toBe(true);
      expect(allowed.remaining).toBe(4);
    });
  });

  describe('RateLimitError', () => {
    it('should create error with correct properties', () => {
      const resetTime = new Date();
      const error = new RateLimitError('Too many requests', resetTime, 0);

      expect(error.message).toBe('Too many requests');
      expect(error.name).toBe('RateLimitError');
      expect(error.resetTime).toBe(resetTime);
      expect(error.remaining).toBe(0);
      expect(error).toBeInstanceOf(Error);
    });
  });
});
