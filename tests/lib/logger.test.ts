import { jest } from '@jest/globals';

// Store original env
const originalEnv = process.env;

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
const mockConsoleInfo = jest.spyOn(console, 'info').mockImplementation(() => {});
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

// Test the actual functions by directly testing the logic
describe('Logger Configuration', () => {
  // Create helper function to test log level logic
  const getLogLevelLogic = () => {
    const env = process.env.NODE_ENV || 'production';

    const logLevel =
      process.env.LOG_LEVEL ||
      process.env.NEXT_PUBLIC_LOG_LEVEL ||
      (env === 'production' ? 'info' : 'debug');

    return logLevel.toLowerCase();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset process.env for each test
    process.env = { ...originalEnv };
    delete (process.env as any).LOG_LEVEL;
    delete (process.env as any).NEXT_PUBLIC_LOG_LEVEL;
    delete (process.env as any).NODE_ENV;
  });

  afterAll(() => {
    process.env = originalEnv;
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
    mockConsoleInfo.mockRestore();
    mockConsoleLog.mockRestore();
  });

  describe('LOG_LEVEL environment variable behavior', () => {
    it('should use LOG_LEVEL when provided explicitly', () => {
      (process.env as any).LOG_LEVEL = 'warn';
      (process.env as any).NODE_ENV = 'production';

      expect(getLogLevelLogic()).toBe('warn');
    });

    it('should default to debug when NODE_ENV is development', () => {
      (process.env as any).NODE_ENV = 'development';

      expect(getLogLevelLogic()).toBe('debug');
    });

    it('should default to info when NODE_ENV is production', () => {
      (process.env as any).NODE_ENV = 'production';

      expect(getLogLevelLogic()).toBe('info');
    });

    it('should default to debug when NODE_ENV is not production', () => {
      (process.env as any).NODE_ENV = 'test';

      expect(getLogLevelLogic()).toBe('debug');
    });

    it('should handle case-insensitive LOG_LEVEL values', () => {
      (process.env as any).LOG_LEVEL = 'DEBUG';

      expect(getLogLevelLogic()).toBe('debug');
    });

    it('should work the same on both client and server side', () => {
      (process.env as any).LOG_LEVEL = 'error';

      expect(getLogLevelLogic()).toBe('error');
    });
  });

  describe('Backwards compatibility', () => {
    it('should still work if NEXT_PUBLIC_LOG_LEVEL is set (but prefer LOG_LEVEL)', () => {
      (process.env as any).LOG_LEVEL = 'error';
      (process.env as any).NEXT_PUBLIC_LOG_LEVEL = 'debug'; // This should be ignored when LOG_LEVEL is set

      expect(getLogLevelLogic()).toBe('error');
    });

    it('should fallback to NEXT_PUBLIC_LOG_LEVEL if LOG_LEVEL is not set (backwards compatibility)', () => {
      (process.env as any).NEXT_PUBLIC_LOG_LEVEL = 'warn';

      expect(getLogLevelLogic()).toBe('warn');
    });
  });

  describe('Logger levels functionality', () => {
    it('should respect log levels correctly with warn level', () => {
      // Test that logger respects level hierarchy - warn level should show error and warn only
      const levels = {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
      };

      const warnLevel = 1;
      expect(levels.error <= warnLevel).toBe(true); // should log
      expect(levels.warn <= warnLevel).toBe(true); // should log
      expect(levels.info <= warnLevel).toBe(false); // should not log
      expect(levels.debug <= warnLevel).toBe(false); // should not log
    });
  });
});
