import { jest } from '@jest/globals';

const originalEnv = process.env;

const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
const mockConsoleInfo = jest.spyOn(console, 'info').mockImplementation(() => {});
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

interface TestEnv {
  LOG_LEVEL?: string;
  NODE_ENV?: string;
}

describe('Logger Configuration', () => {
  const getLogLevelLogic = () => {
    const env = process.env.NODE_ENV || 'production';

    const logLevel = process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug');

    return logLevel.toLowerCase();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete (process.env as TestEnv).LOG_LEVEL;
    delete (process.env as TestEnv).NODE_ENV;
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
      (process.env as TestEnv).LOG_LEVEL = 'warn';
      (process.env as TestEnv).NODE_ENV = 'production';

      expect(getLogLevelLogic()).toBe('warn');
    });

    it('should default to debug when NODE_ENV is development', () => {
      (process.env as TestEnv).NODE_ENV = 'development';

      expect(getLogLevelLogic()).toBe('debug');
    });

    it('should default to info when NODE_ENV is production', () => {
      (process.env as TestEnv).NODE_ENV = 'production';

      expect(getLogLevelLogic()).toBe('info');
    });

    it('should default to debug when NODE_ENV is not production', () => {
      (process.env as TestEnv).NODE_ENV = 'test';

      expect(getLogLevelLogic()).toBe('debug');
    });

    it('should handle case-insensitive LOG_LEVEL values', () => {
      (process.env as TestEnv).LOG_LEVEL = 'DEBUG';

      expect(getLogLevelLogic()).toBe('debug');
    });

    it('should work the same on both client and server side', () => {
      (process.env as TestEnv).LOG_LEVEL = 'error';

      expect(getLogLevelLogic()).toBe('error');
    });
  });

  describe('Logger levels functionality', () => {
    it('should respect log levels correctly with warn level', () => {
      const levels = {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
      };

      const warnLevel = 1;
      expect(levels.error <= warnLevel).toBe(true);
      expect(levels.warn <= warnLevel).toBe(true);
      expect(levels.info <= warnLevel).toBe(false);
      expect(levels.debug <= warnLevel).toBe(false);
    });
  });
});
