import winston from "winston";

type LogLevel = "error" | "warn" | "info" | "debug";

// Simple logger for browser and Edge runtime
const createSimpleLogger = (logLevel: LogLevel) => {
  const levels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };

  const log = (level: LogLevel, ...args: unknown[]) => {
    if (levels[level] > levels[logLevel]) return;
    const consoleMethod = level === "debug" ? "log" : level;
    console[consoleMethod](`[${level}]`, ...args);
  };

  return {
    error: (...args: unknown[]) => log("error", ...args),
    warn: (...args: unknown[]) => log("warn", ...args),
    info: (...args: unknown[]) => log("info", ...args),
    debug: (...args: unknown[]) => log("debug", ...args),
  };
};

// Winston-based logger for Node.js
const createWinstonLogger = (logLevel: LogLevel) => {
  return winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(
        ({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`
      )
    ),
    transports: [new winston.transports.Console()],
    exceptionHandlers: [new winston.transports.Console()],
  });
};

const getLogger = () => {
  const env = process.env.NODE_ENV || "development";
  const logLevel = (
    process.env.LOG_LEVEL ||
    process.env.NEXT_PUBLIC_LOG_LEVEL ||
    (env === "production" ? "info" : "debug")
  ).toLowerCase() as LogLevel;

  if (
    typeof window !== "undefined" ||
    (typeof process !== "undefined" && process.env?.NEXT_RUNTIME === "edge")
  ) {
    return createSimpleLogger(logLevel);
  }

  return createWinstonLogger(logLevel);
};

export default getLogger();
