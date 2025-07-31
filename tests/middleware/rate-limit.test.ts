/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from '@/middleware/rate-limit';

// Mock the logger
jest.mock('@/lib/logger', () => ({
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

// Mock the RateLimiter
const mockCheckLimit = jest.fn();
const mockRateLimiterInstance = {
  checkLimit: mockCheckLimit,
};

jest.mock('@/lib/rate-limiter', () => ({
  RateLimiter: jest.fn(() => mockRateLimiterInstance),
  RateLimitError: class RateLimitError extends Error {
    constructor(
      message: string,
      public resetTime: Date,
      public remaining: number
    ) {
      super(message);
      this.name = 'RateLimitError';
    }
  },
}));

describe('rateLimitMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckLimit.mockClear();
  });

  afterEach(() => {
    delete process.env.ENABLE_RATE_LIMITING;
    delete process.env.RATE_LIMIT_WINDOW_MS;
    delete process.env.RATE_LIMIT_MAX_REQUESTS;
  });

  describe('when rate limiting is disabled', () => {
    it('should pass through without checking limits', async () => {
      process.env.ENABLE_RATE_LIMITING = 'false';

      const request = new NextRequest('http://localhost:3000/api/test');
      const expectedResponse = NextResponse.json({ success: true });
      const mockNext = jest.fn().mockResolvedValue(expectedResponse);

      const result = await rateLimitMiddleware(request, mockNext);

      expect(mockNext).toHaveBeenCalledWith(request);
      expect(mockCheckLimit).not.toHaveBeenCalled();
      expect(result).toBe(expectedResponse);
    });

    it('should default to disabled when ENABLE_RATE_LIMITING is not set', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');
      const expectedResponse = NextResponse.json({ success: true });
      const mockNext = jest.fn().mockResolvedValue(expectedResponse);

      const result = await rateLimitMiddleware(request, mockNext);

      expect(mockNext).toHaveBeenCalledWith(request);
      expect(mockCheckLimit).not.toHaveBeenCalled();
      expect(result).toBe(expectedResponse);
    });
  });

  describe('when rate limiting is enabled', () => {
    beforeEach(() => {
      process.env.ENABLE_RATE_LIMITING = 'true';
    });

    it('should allow requests within limits', async () => {
      mockCheckLimit.mockResolvedValue({
        allowed: true,
        remaining: 4,
        resetTime: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/test');
      const expectedResponse = NextResponse.json({ success: true });
      const mockNext = jest.fn().mockResolvedValue(expectedResponse);

      const result = await rateLimitMiddleware(request, mockNext);

      expect(mockCheckLimit).toHaveBeenCalledWith(request);
      expect(mockNext).toHaveBeenCalledWith(request);
      // Check that headers were added
      expect(result.headers.get('X-RateLimit-Remaining')).toBe('4');
    });

    it('should block requests exceeding limits', async () => {
      const resetTime = new Date();
      mockCheckLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime,
      });

      const request = new NextRequest('http://localhost:3000/api/test');
      const mockNext = jest.fn();

      const result = await rateLimitMiddleware(request, mockNext);

      expect(mockCheckLimit).toHaveBeenCalledWith(request);
      expect(mockNext).not.toHaveBeenCalled();
      expect(result.status).toBe(429);

      const responseData = await result.json();
      expect(responseData).toEqual({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
      });

      expect(result.headers.get('X-RateLimit-Limit')).toBe('60');
      expect(result.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(result.headers.get('X-RateLimit-Reset')).toBe(
        Math.ceil(resetTime.getTime() / 1000).toString()
      );
      expect(result.headers.get('Retry-After')).toBeTruthy();
    });

    it('should handle rate limiter errors gracefully', async () => {
      mockCheckLimit.mockRejectedValue(new Error('Rate limiter error'));

      const request = new NextRequest('http://localhost:3000/api/test');
      const expectedResponse = NextResponse.json({ success: true });
      const mockNext = jest.fn().mockResolvedValue(expectedResponse);

      const result = await rateLimitMiddleware(request, mockNext);

      // Should continue to next middleware on error
      expect(mockNext).toHaveBeenCalledWith(request);
      expect(result).toBe(expectedResponse);
    });
  });
});
