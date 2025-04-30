import util from 'util';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface Logger {
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

const getLogLevel = (): LogLevel => {
  if (typeof window === 'undefined') {
    // Server-side - use environment variables if available
    const env = process.env.NODE_ENV || 'production';
    return (
      process.env.LOG_LEVEL ||
      process.env.NEXT_PUBLIC_LOG_LEVEL ||
      (env === 'production' ? 'info' : 'debug')
    ).toLowerCase() as LogLevel;
  } else {
    // Client-side - use NEXT_PUBLIC_LOG_LEVEL or default
    return (process.env.NEXT_PUBLIC_LOG_LEVEL || 'info').toLowerCase() as LogLevel;
  }
};

const createLogger = (logLevel: LogLevel): Logger => {
  const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };

  const log = (level: LogLevel, ...args: unknown[]) => {
    if (levels[level] > levels[logLevel]) return;
    const consoleMethod = level === 'debug' ? 'log' : level;
    const timestamp = new Date().toISOString();

    const processedArgs = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        return util.inspect(arg, {
          depth: 5,
          colors: false,
          maxArrayLength: 10,
          breakLength: Infinity,
          compact: true,
        });
      }
      return arg;
    });

    console[consoleMethod](`[${timestamp}] [${level}]`, ...processedArgs);
  };

  return {
    error: (...args: unknown[]) => log('error', ...args),
    warn: (...args: unknown[]) => log('warn', ...args),
    info: (...args: unknown[]) => log('info', ...args),
    debug: (...args: unknown[]) => log('debug', ...args),
  };
};

const logger = createLogger(getLogLevel());

export default logger;
